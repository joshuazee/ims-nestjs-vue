import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeptDto, UpdateDeptDto } from './dto/dept.dto';

@Injectable()
export class DeptService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeptDto) {
    const dept = await this.prisma.dept.create({
      data: {
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        leader: dto.leader,
        sort: dto.sort ?? 0,
        status: 1,
      },
    });
    return dept;
  }

  async findAll() {
    const depts = await this.prisma.dept.findMany({
      orderBy: [{ parentId: 'asc' }, { sort: 'asc' }],
    });

    return this.buildTree(depts);
  }

  async findOne(id: number) {
    const dept = await this.prisma.dept.findUnique({ where: { id } });
    if (!dept) {
      throw new NotFoundException('部门不存在');
    }
    return dept;
  }

  async update(id: number, dto: UpdateDeptDto) {
    const dept = await this.prisma.dept.findUnique({ where: { id } });
    if (!dept) {
      throw new NotFoundException('部门不存在');
    }

    return this.prisma.dept.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        leader: dto.leader,
        sort: dto.sort,
        status: dto.status,
      },
    });
  }

  async remove(id: number) {
    const dept = await this.prisma.dept.findUnique({ where: { id } });
    if (!dept) {
      throw new NotFoundException('部门不存在');
    }

    // 检查是否有子部门
    const children = await this.prisma.dept.count({ where: { parentId: id } });
    if (children > 0) {
      throw new NotFoundException('该部门存在子部门，无法删除');
    }

    // 检查是否有用户关联
    const users = await this.prisma.user.count({ where: { deptId: id } });
    if (users > 0) {
      throw new NotFoundException('该部门存在用户，无法删除');
    }

    await this.prisma.dept.delete({ where: { id } });
    return { id };
  }

  private buildTree(depts: any[]) {
    const map = new Map<number, any>();
    const roots: any[] = [];

    depts.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    depts.forEach((dept) => {
      const node = map.get(dept.id);
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
