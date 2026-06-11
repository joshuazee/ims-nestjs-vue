import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';
import {
  CreateDictTypeDto,
  UpdateDictTypeDto,
  CreateDictItemDto,
  UpdateDictItemDto,
} from './dto/dict.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../../common/decorators/roles.decorator';

@ApiTags('字典管理')
@Controller('dicts')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class DictController {
  constructor(private dictService: DictService) {}

  // ========== 字典类型 ==========
  @Post('types')
  @Permissions('dict:create')
  @ApiOperation({ summary: '创建字典类型' })
  createType(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createType(dto);
  }

  @Get('types')
  @Permissions('dict:list')
  @ApiOperation({ summary: '字典类型列表' })
  findAllTypes() {
    return this.dictService.findAllTypes();
  }

  @Get('types/:id')
  @Permissions('dict:list')
  @ApiOperation({ summary: '字典类型详情' })
  findOneType(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findOneType(id);
  }

  @Put('types/:id')
  @Permissions('dict:update')
  @ApiOperation({ summary: '更新字典类型' })
  updateType(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDictTypeDto) {
    return this.dictService.updateType(id, dto);
  }

  @Delete('types/:id')
  @Permissions('dict:delete')
  @ApiOperation({ summary: '删除字典类型' })
  removeType(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeType(id);
  }

  // ========== 字典项 ==========
  @Post('items')
  @Permissions('dict:create')
  @ApiOperation({ summary: '创建字典项' })
  createItem(@Body() dto: CreateDictItemDto) {
    return this.dictService.createItem(dto);
  }

  @Get('types/:id/items')
  @Permissions('dict:list')
  @ApiOperation({ summary: '获取字典项列表' })
  findItemsByTypeId(@Param('id', ParseIntPipe) dictTypeId: number) {
    return this.dictService.findItemsByTypeId(dictTypeId);
  }

  @Get('items/:id')
  @Permissions('dict:list')
  @ApiOperation({ summary: '字典项详情' })
  findOneItem(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findOneItem(id);
  }

  @Put('items/:id')
  @Permissions('dict:update')
  @ApiOperation({ summary: '更新字典项' })
  updateItem(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDictItemDto) {
    return this.dictService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Permissions('dict:delete')
  @ApiOperation({ summary: '删除字典项' })
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeItem(id);
  }
}
