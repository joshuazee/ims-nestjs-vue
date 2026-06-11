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
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ResetPasswordDto,
  AssignRolesDto,
  UserQueryDto,
} from './dto/user.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../../common/decorators/roles.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Permissions('user:create')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @Permissions('user:list')
  @ApiOperation({ summary: '用户列表' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Permissions('user:list')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Permissions('user:update')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Put(':id/status')
  @Permissions('user:update')
  @ApiOperation({ summary: '修改用户状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(id, dto);
  }

  @Put(':id/password')
  @Permissions('user:update')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(id, dto);
  }

  @Put(':id/roles')
  @Permissions('user:update')
  @ApiOperation({ summary: '分配角色' })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.userService.assignRoles(id, dto);
  }
}
