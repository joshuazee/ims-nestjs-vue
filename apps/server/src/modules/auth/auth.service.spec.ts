jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: any;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('应成功登录并返回token', async () => {
      const dto = { username: 'admin', password: 'admin123' };
      const user = {
        id: 1,
        username: dto.username,
        password: '$2a$12$hashedpassword',
        status: 1,
        roles: [{ role: { id: 1, name: '超级管理员' } }],
      };

      prisma.user.findUnique.mockResolvedValue(user as any);
      prisma.refreshToken.create.mockResolvedValue({ id: 1 } as any);
      jwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('用户不存在时应抛出UnauthorizedException', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ username: 'notexist', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('用户被禁用时应抛出UnauthorizedException', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
        status: 0,
      } as any);

      await expect(
        service.login({ username: 'admin', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('应成功刷新token', async () => {
      const refreshToken = 'valid-refresh-token';
      const stored = {
        id: 1,
        userId: 1,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 1,
          username: 'admin',
          roles: [{ role: { id: 1 } }],
        },
      };

      prisma.refreshToken.findUnique.mockResolvedValue(stored as any);
      prisma.refreshToken.delete.mockResolvedValue({ id: 1 } as any);
      prisma.refreshToken.create.mockResolvedValue({ id: 2 } as any);
      jwtService.sign.mockReturnValue('new-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('refresh token过期时应抛出UnauthorizedException', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 86400000),
      } as any);

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('应删除用户的所有refresh token', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 } as any);

      await service.logout(1);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('getMe', () => {
    it('应返回用户信息包含权限', async () => {
      const user = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@test.com',
        phone: '13800138000',
        avatar: null,
        deptId: 1,
        dept: { id: 1, name: '技术部' },
        status: 1,
        roles: [{ role: { id: 1, name: '超级管理员' } }],
      };

      prisma.user.findUnique.mockResolvedValue(user as any);
      prisma.userRole.findMany.mockResolvedValue([
        {
          role: {
            menus: [
              { menu: { permission: 'user:list' } },
              { menu: { permission: 'user:create' } },
            ],
          },
        },
      ] as any);

      const result = await service.getMe(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('username', 'admin');
      expect(result).toHaveProperty('permissions');
      expect(result!.permissions).toContain('user:list');
      expect(result!.permissions).toContain('user:create');
    });
  });
});
