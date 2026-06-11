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
import { DeptService } from './dept.service';
import { CreateDeptDto, UpdateDeptDto } from './dto/dept.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../../common/decorators/roles.decorator';

@ApiTags('部门管理')
@Controller('depts')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class DeptController {
  constructor(private deptService: DeptService) {}

  @Post()
  @Permissions('dept:create')
  @ApiOperation({ summary: '创建部门' })
  create(@Body() dto: CreateDeptDto) {
    return this.deptService.create(dto);
  }

  @Get()
  @Permissions('dept:list')
  @ApiOperation({ summary: '部门列表（树形）' })
  findAll() {
    return this.deptService.findAll();
  }

  @Get(':id')
  @Permissions('dept:list')
  @ApiOperation({ summary: '部门详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.findOne(id);
  }

  @Put(':id')
  @Permissions('dept:update')
  @ApiOperation({ summary: '更新部门' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDeptDto) {
    return this.deptService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('dept:delete')
  @ApiOperation({ summary: '删除部门' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.remove(id);
  }
}
