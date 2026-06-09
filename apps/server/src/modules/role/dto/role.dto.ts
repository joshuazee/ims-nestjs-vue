import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @Length(2, 50)
  name: string;

  @IsString()
  @IsNotEmpty({ message: '角色编码不能为空' })
  @Length(2, 50)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, { message: '角色编码只能包含字母、数字和下划线，且不能以数字开头' })
  code: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number = 0;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

export class AssignMenusDto {
  @IsInt({ each: true })
  @IsNotEmpty({ message: '菜单ID不能为空' })
  menuIds: number[];
}

export class RoleQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;

  page: number = 1;
  pageSize: number = 20;
}
