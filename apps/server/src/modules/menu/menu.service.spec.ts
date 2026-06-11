import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('MenuService', () => {
  let service: MenuService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  describe('create', () => {
    it('应创建菜单并返回', async () => {
      const dto = {
        name: '用户管理',
        type: 'MENU' as const,
        path: '/system/user',
        component: 'system/user/UserView',
        icon: 'User',
        permission: 'user:list',
        parentId: 1,
        sort: 1,
      };
      const createdMenu = {
        id: 2,
        ...dto,
        status: 1,
        isExternal: false,
        isCache: true,
        isHidden: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.menu.create.mockResolvedValue(createdMenu as any);

      const result = await service.create(dto);

      expect(result.id).toBe(2);
      expect(result.name).toBe(dto.name);
      expect(result.type).toBe('MENU');
    });
  });

  describe('findAll', () => {
    it('应返回树形菜单结构', async () => {
      const menus = [
        { id: 1, name: '系统管理', type: 'DIR', parentId: null, sort: 1, status: 1 },
        { id: 2, name: '用户管理', type: 'MENU', parentId: 1, sort: 1, status: 1 },
        { id: 3, name: '角色管理', type: 'MENU', parentId: 1, sort: 2, status: 1 },
        { id: 4, name: '新增用户', type: 'BUTTON', parentId: 2, sort: 1, status: 1 },
      ];

      prisma.menu.findMany.mockResolvedValue(menus as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].children).toHaveLength(1);
    });

    it('空菜单应返回空数组', async () => {
      prisma.menu.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('应返回菜单详情', async () => {
      const menu = {
        id: 1,
        name: '系统管理',
        type: 'DIR',
        path: '/system',
        status: 1,
      };

      prisma.menu.findUnique.mockResolvedValue(menu as any);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('系统管理');
    });

    it('菜单不存在时应抛出异常', async () => {
      prisma.menu.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('菜单不存在');
    });
  });

  describe('update', () => {
    it('应更新菜单信息', async () => {
      const dto = { name: '新菜单名', sort: 5 };
      const updatedMenu = { id: 1, name: '新菜单名', type: 'DIR', sort: 5, status: 1 };

      prisma.menu.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.menu.update.mockResolvedValue(updatedMenu as any);

      const result = await service.update(1, dto);

      expect(result.name).toBe('新菜单名');
      expect(result.sort).toBe(5);
    });
  });

  describe('remove', () => {
    it('应删除无子菜单的菜单', async () => {
      prisma.menu.findUnique.mockResolvedValue({ id: 3 } as any);
      prisma.menu.count.mockResolvedValue(0);
      prisma.menu.delete.mockResolvedValue({} as any);

      const result = await service.remove(3);

      expect(result.id).toBe(3);
      expect(prisma.menu.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it('有子菜单时应抛出异常', async () => {
      prisma.menu.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.menu.count.mockResolvedValue(2);

      await expect(service.remove(1)).rejects.toThrow('该菜单存在子菜单');
    });
  });
});
