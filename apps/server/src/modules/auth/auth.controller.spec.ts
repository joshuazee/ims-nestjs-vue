import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: {
    login: jest.Mock;
    refreshToken: jest.Mock;
    logout: jest.Mock;
    getMe: jest.Mock;
  };
  let canActivateSpy: jest.SpyInstance;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      getMe: jest.fn(),
    };

    canActivateSpy = jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    canActivateSpy?.mockRestore();
    await app.close();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('应登录成功并返回token', async () => {
      const dto = { username: 'admin', password: 'admin123' };
      const tokenResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 7200,
        refreshExpiresIn: 604800,
      };

      authService.login.mockResolvedValue(tokenResponse as any);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBe('access-token');
          expect(res.body.refreshToken).toBe('refresh-token');
        });
    });
  });

  describe('POST /auth/refresh', () => {
    it('应刷新token', async () => {
      const dto = { refreshToken: 'old-refresh-token' };
      const tokenResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 7200,
        refreshExpiresIn: 604800,
      };

      authService.refreshToken.mockResolvedValue(tokenResponse as any);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBe('new-access-token');
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('应退出登录', async () => {
      authService.logout.mockResolvedValue(undefined);

      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('退出成功');
        });
    });
  });

  describe('GET /auth/me', () => {
    it('应返回当前用户信息', async () => {
      const userInfo = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        roles: [{ id: 1, name: '超级管理员' }],
        permissions: ['user:list', 'user:create'],
      };

      authService.getMe.mockResolvedValue(userInfo as any);

      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.username).toBe('admin');
          expect(res.body.permissions).toContain('user:list');
        });
    });
  });
});
