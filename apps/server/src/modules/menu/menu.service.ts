import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuDto) {
    const menu = await this.prisma.menu.create({
      data: {
        name: dto.name,
        type: dto.type,
        path: dto.path,
        component: dto.component,
        icon: dto.icon,
        permission: dto.permission,
        parentId: dto.parentId,
        sort: dto.sort ?? 0,
        isExternal: dto.isExternal ?? false,
        isCache: dto.isCache ?? true,
        isHidden: dto.isHidden ?? false,
        status: 1,
      },
    });
    return menu;
  }

  async findAll() {
    const menus = await this.prisma.menu.findMany({
      orderBy: [{ parentId: 'asc' }, { sort: 'asc' }],
    });

    return this.buildTree(menus);
  }

  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return this.prisma.menu.update({
      where: { id },
      data: {
        name: dto.name,
        path: dto.path,
        component: dto.component,
        icon: dto.icon,
        permission: dto.permission,
        parentId: dto.parentId,
        sort: dto.sort,
        status: dto.status,
      },
    });
  }

  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    const children = await this.prisma.menu.count({ where: { parentId: id } });
    if (children > 0) {
      throw new NotFoundException('该菜单存在子菜单，无法删除');
    }

    await this.prisma.menu.delete({ where: { id } });
    return { id };
  }

  private buildTree(menus: any[]) {
    const map = new Map<number, any>();
    const roots: any[] = [];

    menus.forEach((menu) => {
      map.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const node = map.get(menu.id);
      if (menu.parentId && map.has(menu.parentId)) {
        map.get(menu.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
