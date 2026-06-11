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
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../../common/decorators/roles.decorator';

@ApiTags('菜单管理')
@Controller('menus')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Post()
  @Permissions('menu:create')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @Permissions('menu:list')
  @ApiOperation({ summary: '菜单列表（树形）' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @Permissions('menu:list')
  @ApiOperation({ summary: '菜单详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @Permissions('menu:update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('menu:delete')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
