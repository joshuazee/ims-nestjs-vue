import { Test, TestingModule } from '@nestjs/testing';
import { DeptService } from './dept.service';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('DeptService', () => {
  let service: DeptService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeptService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DeptService>(DeptService);
  });

  describe('create', () => {
    it('应创建部门并返回', async () => {
      const dto = { name: '技术部', code: 'tech', parentId: 1, leader: '张三', sort: 1 };
      const createdDept = { id: 2, ...dto, status: 1, createdAt: new Date(), updatedAt: new Date() };

      prisma.dept.create.mockResolvedValue(createdDept as any);

      const result = await service.create(dto);

      expect(result.id).toBe(2);
      expect(result.name).toBe(dto.name);
      expect(result.code).toBe(dto.code);
    });
  });

  describe('findAll', () => {
    it('应返回树形部门结构', async () => {
      const depts = [
        { id: 1, name: '总部', parentId: null, sort: 1, status: 1 },
        { id: 2, name: '技术部', parentId: 1, sort: 1, status: 1 },
        { id: 3, name: '产品部', parentId: 1, sort: 2, status: 1 },
        { id: 4, name: '前端组', parentId: 2, sort: 1, status: 1 },
      ];

      prisma.dept.findMany.mockResolvedValue(depts as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].children).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('应返回部门详情', async () => {
      const dept = { id: 1, name: '技术部', code: 'tech', leader: '张三', sort: 1, status: 1 };

      prisma.dept.findUnique.mockResolvedValue(dept as any);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('技术部');
    });

    it('部门不存在时应抛出异常', async () => {
      prisma.dept.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('部门不存在');
    });
  });

  describe('update', () => {
    it('应更新部门信息', async () => {
      const dto = { name: '新技术部', leader: '李四' };
      const updatedDept = { id: 1, name: '新技术部', code: 'tech', leader: '李四', sort: 1, status: 1 };

      prisma.dept.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dept.update.mockResolvedValue(updatedDept as any);

      const result = await service.update(1, dto);

      expect(result.name).toBe('新技术部');
      expect(result.leader).toBe('李四');
    });
  });

  describe('remove', () => {
    it('应删除无子部门和用户的部门', async () => {
      prisma.dept.findUnique.mockResolvedValue({ id: 3 } as any);
      prisma.dept.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.dept.delete.mockResolvedValue({} as any);

      const result = await service.remove(3);

      expect(result.id).toBe(3);
      expect(prisma.dept.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it('有子部门时应抛出异常', async () => {
      prisma.dept.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dept.count.mockResolvedValue(2);

      await expect(service.remove(1)).rejects.toThrow('该部门存在子部门');
    });

    it('有用户关联时应抛出异常', async () => {
      prisma.dept.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dept.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow('该部门存在用户');
    });
  });
});
