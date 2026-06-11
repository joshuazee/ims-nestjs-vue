import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignMenusDto,
  RoleQueryDto,
} from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        sort: dto.sort ?? 0,
        status: 1,
      },
    });
    return role;
  }

  async findAll(query: RoleQueryDto) {
    const { keyword, status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        menus: { include: { menu: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      ...role,
      menus: role.menus.map((rm) => rm.menu),
    };
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        sort: dto.sort,
        status: dto.status,
      },
    });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    await this.prisma.role.delete({ where: { id } });
    return { id };
  }

  async assignMenus(id: number, dto: AssignMenusDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.roleMenu.deleteMany({ where: { roleId: id } });
      if (dto.menuIds.length > 0) {
        await tx.roleMenu.createMany({
          data: dto.menuIds.map((menuId) => ({
            roleId: id,
            menuId,
          })),
        });
      }
    });

    return this.findOne(id);
  }
}
