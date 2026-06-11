import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ResetPasswordDto,
  AssignRolesDto,
  UserQueryDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        deptId: dto.deptId,
        status: 1,
        roles: dto.roleIds?.length
          ? {
              create: dto.roleIds.map((roleId) => ({ roleId })),
            }
          : undefined,
      },
      include: {
        dept: true,
        roles: { include: { role: true } },
      },
    });

    return this.formatUser(user);
  }

  async findAll(query: UserQueryDto) {
    const { keyword, deptId, status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { nickname: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }
    if (deptId !== undefined) {
      where.deptId = deptId;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          dept: true,
          roles: { include: { role: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list: list.map((user) => this.formatUser(user)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        dept: true,
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUser(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        deptId: dto.deptId,
      },
      include: {
        dept: true,
        roles: { include: { role: true } },
      },
    });

    return this.formatUser(updated);
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  async updateStatus(id: number, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: {
        dept: true,
        roles: { include: { role: true } },
      },
    });

    return this.formatUser(updated);
  }

  async resetPassword(id: number, dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: '密码重置成功' };
  }

  async assignRoles(id: number, dto: AssignRolesDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      if (dto.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        });
      }
    });

    return this.findOne(id);
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      deptId: user.deptId,
      deptName: user.dept?.name || null,
      status: user.status,
      roles: user.roles?.map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
