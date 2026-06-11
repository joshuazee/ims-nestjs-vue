import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('UserController', () => {
  let app: INestApplication;
  let userService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    updateStatus: jest.Mock;
    resetPassword: jest.Mock;
    assignRoles: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateStatus: jest.fn(),
      resetPassword: jest.fn(),
      assignRoles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('应创建用户', async () => {
      const dto = {
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
      };
      const createdUser = {
        id: 1,
        username: dto.username,
        nickname: dto.nickname,
        status: 1,
      };

      userService.create.mockResolvedValue(createdUser as any);

      return request(app.getHttpServer())
        .post('/users')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(createdUser);
        });
    });
  });

  describe('GET /users', () => {
    it('应返回用户列表', async () => {
      const paginatedResult = {
        list: [
          { id: 1, username: 'user1', nickname: '用户1' },
          { id: 2, username: 'user2', nickname: '用户2' },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
      };

      userService.findAll.mockResolvedValue(paginatedResult as any);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.list).toHaveLength(2);
          expect(res.body.total).toBe(2);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('应返回用户详情', async () => {
      const user = {
        id: 1,
        username: 'user1',
        nickname: '用户1',
        deptName: '技术部',
        roles: [{ id: 1, name: '管理员' }],
      };

      userService.findOne.mockResolvedValue(user as any);

      return request(app.getHttpServer())
        .get('/users/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.username).toBe('user1');
        });
    });
  });

  describe('PUT /users/:id', () => {
    it('应更新用户', async () => {
      const dto = { nickname: '新昵称' };
      const updatedUser = { id: 1, username: 'user1', nickname: '新昵称' };

      userService.update.mockResolvedValue(updatedUser as any);

      return request(app.getHttpServer())
        .put('/users/1')
        .send(dto)
        .expect(200)
        .expect((res) => {
          expect(res.body.nickname).toBe('新昵称');
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('应删除用户', async () => {
      userService.remove.mockResolvedValue({ id: 1 } as any);

      return request(app.getHttpServer())
        .delete('/users/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
        });
    });
  });

  describe('PUT /users/:id/status', () => {
    it('应修改用户状态', async () => {
      const dto = { status: 0 };
      const updatedUser = { id: 1, username: 'user1', status: 0 };

      userService.updateStatus.mockResolvedValue(updatedUser as any);

      return request(app.getHttpServer())
        .put('/users/1/status')
        .send(dto)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(0);
        });
    });
  });

  describe('PUT /users/:id/password', () => {
    it('应重置密码', async () => {
      const dto = { password: 'newpassword' };

      userService.resetPassword.mockResolvedValue({ message: '密码重置成功' } as any);

      return request(app.getHttpServer())
        .put('/users/1/password')
        .send(dto)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('密码重置成功');
        });
    });
  });

  describe('PUT /users/:id/roles', () => {
    it('应分配角色', async () => {
      const dto = { roleIds: [1, 2] };
      const updatedUser = { id: 1, username: 'user1', roles: [{ id: 1, name: '管理员' }] };

      userService.assignRoles.mockResolvedValue(updatedUser as any);

      return request(app.getHttpServer())
        .put('/users/1/roles')
        .send(dto)
        .expect(200)
        .expect((res) => {
          expect(res.body.roles).toHaveLength(1);
        });
    });
  });
});