import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignMenusDto,
  RoleQueryDto,
} from './dto/role.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../../common/decorators/roles.decorator';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @Permissions('role:create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Get()
  @Permissions('role:list')
  @ApiOperation({ summary: '角色列表' })
  findAll(@Query() query: RoleQueryDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @Permissions('role:list')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @Permissions('role:update')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @Put(':id/menus')
  @Permissions('role:update')
  @ApiOperation({ summary: '分配菜单权限' })
  assignMenus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignMenusDto,
  ) {
    return this.roleService.assignMenus(id, dto);
  }
}
