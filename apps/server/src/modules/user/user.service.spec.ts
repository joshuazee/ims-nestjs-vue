import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('应创建用户并返回格式化结果', async () => {
      const dto = {
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com',
        phone: '13800138000',
        deptId: 1,
        roleIds: [1, 2],
      };

      const createdUser = {
        id: 1,
        username: dto.username,
        password: 'hashedpassword',
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        avatar: null,
        deptId: dto.deptId,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        dept: { id: 1, name: '技术部' },
        roles: [
          { role: { id: 1, name: '管理员' } },
          { role: { id: 2, name: '用户' } },
        ],
      };

      prisma.user.create.mockResolvedValue(createdUser as any);

      const result = await service.create(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: dto.username,
          nickname: dto.nickname,
          email: dto.email,
          phone: dto.phone,
          deptId: dto.deptId,
          status: 1,
          roles: {
            create: [{ roleId: 1 }, { roleId: 2 }],
          },
        }),
        include: {
          dept: true,
          roles: { include: { role: true } },
        },
      });
      expect(result.id).toBe(1);
      expect(result.username).toBe(dto.username);
      expect(result.roles).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('应返回分页的用户列表', async () => {
      const users = [
        {
          id: 1,
          username: 'user1',
          nickname: '用户1',
          email: 'user1@test.com',
          phone: '13800138001',
          avatar: null,
          deptId: 1,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          dept: { id: 1, name: '技术部' },
          roles: [],
        },
      ];

      prisma.user.findMany.mockResolvedValue(users as any);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll({
        keyword: 'user',
        page: 1,
        pageSize: 20,
      });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('应按部门筛选用户', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll({ deptId: 1, page: 1, pageSize: 20 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deptId: 1 }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('应返回用户详情', async () => {
      const user = {
        id: 1,
        username: 'user1',
        nickname: '用户1',
        email: 'user1@test.com',
        phone: '13800138001',
        avatar: null,
        deptId: 1,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        dept: { id: 1, name: '技术部' },
        roles: [{ role: { id: 1, name: '管理员' } }],
      };

      prisma.user.findUnique.mockResolvedValue(user as any);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.username).toBe('user1');
      expect(result.deptName).toBe('技术部');
    });

    it('用户不存在时应抛出异常', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('用户不存在');
    });
  });

  describe('update', () => {
    it('应更新用户信息', async () => {
      const dto = { nickname: '新昵称' };
      const updatedUser = {
        id: 1,
        username: 'user1',
        nickname: '新昵称',
        email: 'user1@test.com',
        phone: '13800138001',
        avatar: null,
        deptId: 1,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        dept: { id: 1, name: '技术部' },
        roles: [],
      };

      prisma.user.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.update(1, dto);

      expect(result.nickname).toBe('新昵称');
    });
  });

  describe('remove', () => {
    it('应删除用户并返回ID', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.user.delete.mockResolvedValue({} as any);

      const result = await service.remove(1);

      expect(result.id).toBe(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('updateStatus', () => {
    it('应修改用户状态', async () => {
      const updatedUser = {
        id: 1,
        username: 'user1',
        nickname: '用户1',
        email: 'user1@test.com',
        phone: '13800138001',
        avatar: null,
        deptId: 1,
        status: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        dept: { id: 1, name: '技术部' },
        roles: [],
      };

      prisma.user.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.updateStatus(1, { status: 0 });

      expect(result.status).toBe(0);
    });
  });

  describe('resetPassword', () => {
    it('应重置用户密码', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.user.update.mockResolvedValue({} as any);

      const result = await service.resetPassword(1, { password: 'newpassword' });

      expect(result.message).toBe('密码重置成功');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ password: expect.any(String) }),
      });
    });
  });

  describe('assignRoles', () => {
    it('应分配角色给用户', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.userRole.deleteMany.mockResolvedValue({ count: 0 } as any);
      prisma.userRole.createMany.mockResolvedValue({ count: 2 } as any);

      const userAfter = {
        id: 1,
        username: 'user1',
        nickname: '用户1',
        email: 'user1@test.com',
        phone: '13800138001',
        avatar: null,
        deptId: 1,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        dept: { id: 1, name: '技术部' },
        roles: [{ role: { id: 1, name: '管理员' } }],
      };
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce(userAfter as any);

      await service.assignRoles(1, { roleIds: [1] });

      expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(prisma.userRole.createMany).toHaveBeenCalledWith({
        data: [{ userId: 1, roleId: 1 }],
      });
    });
  });
});
