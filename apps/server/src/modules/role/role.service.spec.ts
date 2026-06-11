import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  describe('create', () => {
    it('应创建角色并返回', async () => {
      const dto = { name: '测试角色', code: 'test_role', description: '测试', sort: 1 };
      const createdRole = { id: 1, ...dto, status: 1, createdAt: new Date(), updatedAt: new Date() };

      prisma.role.create.mockResolvedValue(createdRole as any);

      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(result.name).toBe(dto.name);
      expect(result.code).toBe(dto.code);
    });
  });

  describe('findAll', () => {
    it('应返回分页的角色列表', async () => {
      const roles = [
        { id: 1, name: '管理员', code: 'admin', description: '系统管理员', sort: 1, status: 1 },
        { id: 2, name: '用户', code: 'user', description: '普通用户', sort: 2, status: 1 },
      ];

      prisma.role.findMany.mockResolvedValue(roles as any);
      prisma.role.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, pageSize: 20 });

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('应按关键词搜索角色', async () => {
      prisma.role.findMany.mockResolvedValue([]);
      prisma.role.count.mockResolvedValue(0);

      await service.findAll({ keyword: 'admin', page: 1, pageSize: 20 });

      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'admin' } },
              { code: { contains: 'admin' } },
            ],
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('应返回角色详情及菜单', async () => {
      const role = {
        id: 1,
        name: '管理员',
        code: 'admin',
        menus: [
          { menu: { id: 1, name: '用户管理', permission: 'user:list' } },
          { menu: { id: 2, name: '角色管理', permission: 'role:list' } },
        ],
      };

      prisma.role.findUnique.mockResolvedValue(role as any);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.menus).toHaveLength(2);
      expect(result.menus[0].permission).toBe('user:list');
    });

    it('角色不存在时应抛出异常', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('角色不存在');
    });
  });

  describe('update', () => {
    it('应更新角色信息', async () => {
      const dto = { name: '新角色名', sort: 5 };
      const updatedRole = { id: 1, name: '新角色名', code: 'admin', sort: 5, status: 1 };

      prisma.role.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.role.update.mockResolvedValue(updatedRole as any);

      const result = await service.update(1, dto);

      expect(result.name).toBe('新角色名');
      expect(result.sort).toBe(5);
    });
  });

  describe('remove', () => {
    it('应删除角色并返回ID', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.role.delete.mockResolvedValue({} as any);

      const result = await service.remove(1);

      expect(result.id).toBe(1);
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('assignMenus', () => {
    it('应分配菜单权限给角色', async () => {
      const role = { id: 1, name: '管理员', code: 'admin' };
      prisma.role.findUnique.mockResolvedValue(role as any);
      prisma.roleMenu.deleteMany.mockResolvedValue({ count: 0 } as any);
      prisma.roleMenu.createMany.mockResolvedValue({ count: 2 } as any);
      prisma.role.findUnique.mockResolvedValueOnce(role as any).mockResolvedValueOnce({
        ...role,
        menus: [
          { menu: { id: 1, name: '用户管理' } },
        ],
      } as any);

      await service.assignMenus(1, { menuIds: [1, 2] });

      expect(prisma.roleMenu.deleteMany).toHaveBeenCalledWith({ where: { roleId: 1 } });
      expect(prisma.roleMenu.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 1, menuId: 1 },
          { roleId: 1, menuId: 2 },
        ],
      });
    });
  });
});
