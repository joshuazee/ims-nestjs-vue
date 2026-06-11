import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDictTypeDto,
  UpdateDictTypeDto,
  CreateDictItemDto,
  UpdateDictItemDto,
} from './dto/dict.dto';

@Injectable()
export class DictService {
  constructor(private prisma: PrismaService) {}

  // ========== 字典类型 ==========
  async createType(dto: CreateDictTypeDto) {
    return this.prisma.dictType.create({
      data: {
        name: dto.name,
        code: dto.code,
        status: 1,
      },
    });
  }

  async findAllTypes() {
    return this.prisma.dictType.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async findOneType(id: number) {
    const type = await this.prisma.dictType.findUnique({
      where: { id },
      include: { items: { orderBy: { sort: 'asc' } } },
    });
    if (!type) {
      throw new NotFoundException('字典类型不存在');
    }
    return type;
  }

  async updateType(id: number, dto: UpdateDictTypeDto) {
    const type = await this.prisma.dictType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('字典类型不存在');
    }
    return this.prisma.dictType.update({
      where: { id },
      data: dto,
    });
  }

  async removeType(id: number) {
    const type = await this.prisma.dictType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('字典类型不存在');
    }
    await this.prisma.dictType.delete({ where: { id } });
    return { id };
  }

  // ========== 字典项 ==========
  async createItem(dto: CreateDictItemDto) {
    const type = await this.prisma.dictType.findUnique({
      where: { id: dto.dictTypeId },
    });
    if (!type) {
      throw new NotFoundException('字典类型不存在');
    }

    return this.prisma.dictItem.create({
      data: {
        dictTypeId: dto.dictTypeId,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
        status: 1,
      },
    });
  }

  async findItemsByTypeId(dictTypeId: number) {
    return this.prisma.dictItem.findMany({
      where: { dictTypeId },
      orderBy: { sort: 'asc' },
    });
  }

  async findOneItem(id: number) {
    const item = await this.prisma.dictItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    return item;
  }

  async updateItem(id: number, dto: UpdateDictItemDto) {
    const item = await this.prisma.dictItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    return this.prisma.dictItem.update({
      where: { id },
      data: dto,
    });
  }

  async removeItem(id: number) {
    const item = await this.prisma.dictItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    await this.prisma.dictItem.delete({ where: { id } });
    return { id };
  }
}
