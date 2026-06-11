import { Test, TestingModule } from '@nestjs/testing';
import { DictService } from './dict.service';
import { createMockPrismaService } from '../../../test/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('DictService', () => {
  let service: DictService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DictService>(DictService);
  });

  describe('createType', () => {
    it('应创建字典类型并返回', async () => {
      const dto = { name: '用户状态', code: 'user_status' };
      const createdType = { id: 1, ...dto, status: 1, createdAt: new Date(), updatedAt: new Date() };

      prisma.dictType.create.mockResolvedValue(createdType as any);

      const result = await service.createType(dto);

      expect(result.id).toBe(1);
      expect(result.name).toBe(dto.name);
      expect(result.code).toBe(dto.code);
    });
  });

  describe('findAllTypes', () => {
    it('应返回所有字典类型', async () => {
      const types = [
        { id: 1, name: '用户状态', code: 'user_status', status: 1, _count: { items: 2 } },
        { id: 2, name: '菜单类型', code: 'menu_type', status: 1, _count: { items: 3 } },
      ];

      prisma.dictType.findMany.mockResolvedValue(types as any);

      const result = await service.findAllTypes();

      expect(result).toHaveLength(2);
      expect(result[0]._count.items).toBe(2);
    });
  });

  describe('findOneType', () => {
    it('应返回字典类型详情及字典项', async () => {
      const type = {
        id: 1,
        name: '用户状态',
        code: 'user_status',
        status: 1,
        items: [
          { id: 1, dictTypeId: 1, label: '启用', value: '1', sort: 1, status: 1 },
          { id: 2, dictTypeId: 1, label: '禁用', value: '0', sort: 2, status: 1 },
        ],
      };

      prisma.dictType.findUnique.mockResolvedValue(type as any);

      const result = await service.findOneType(1);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].label).toBe('启用');
    });

    it('字典类型不存在时应抛出异常', async () => {
      prisma.dictType.findUnique.mockResolvedValue(null);

      await expect(service.findOneType(999)).rejects.toThrow('字典类型不存在');
    });
  });

  describe('updateType', () => {
    it('应更新字典类型', async () => {
      const dto = { name: '新状态名', status: 0 };
      const updatedType = { id: 1, name: '新状态名', code: 'user_status', status: 0 };

      prisma.dictType.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dictType.update.mockResolvedValue(updatedType as any);

      const result = await service.updateType(1, dto);

      expect(result.name).toBe('新状态名');
      expect(result.status).toBe(0);
    });
  });

  describe('removeType', () => {
    it('应删除字典类型并返回ID', async () => {
      prisma.dictType.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dictType.delete.mockResolvedValue({} as any);

      const result = await service.removeType(1);

      expect(result.id).toBe(1);
    });
  });

  describe('createItem', () => {
    it('应创建字典项并返回', async () => {
      const dto = { dictTypeId: 1, label: '待审核', value: '2', sort: 3 };
      const createdItem = { id: 3, ...dto, status: 1, createdAt: new Date(), updatedAt: new Date() };

      prisma.dictType.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dictItem.create.mockResolvedValue(createdItem as any);

      const result = await service.createItem(dto);

      expect(result.id).toBe(3);
      expect(result.label).toBe('待审核');
      expect(result.value).toBe('2');
    });

    it('字典类型不存在时应抛出异常', async () => {
      prisma.dictType.findUnique.mockResolvedValue(null);

      await expect(
        service.createItem({ dictTypeId: 999, label: '测试', value: 'test' }),
      ).rejects.toThrow('字典类型不存在');
    });
  });

  describe('findItemsByTypeId', () => {
    it('应返回字典类型下的所有字典项', async () => {
      const items = [
        { id: 1, dictTypeId: 1, label: '启用', value: '1', sort: 1, status: 1 },
        { id: 2, dictTypeId: 1, label: '禁用', value: '0', sort: 2, status: 1 },
      ];

      prisma.dictItem.findMany.mockResolvedValue(items as any);

      const result = await service.findItemsByTypeId(1);

      expect(result).toHaveLength(2);
      expect(result[0].dictTypeId).toBe(1);
    });
  });

  describe('updateItem', () => {
    it('应更新字典项', async () => {
      const dto = { label: '新标签', value: 'new_value', sort: 5 };
      const updatedItem = { id: 1, dictTypeId: 1, label: '新标签', value: 'new_value', sort: 5, status: 1 };

      prisma.dictItem.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dictItem.update.mockResolvedValue(updatedItem as any);

      const result = await service.updateItem(1, dto);

      expect(result.label).toBe('新标签');
      expect(result.value).toBe('new_value');
      expect(result.sort).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('应删除字典项并返回ID', async () => {
      prisma.dictItem.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.dictItem.delete.mockResolvedValue({} as any);

      const result = await service.removeItem(1);

      expect(result.id).toBe(1);
    });
  });
});