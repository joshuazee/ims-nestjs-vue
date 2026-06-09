import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Min, Max, IsBoolean, Matches } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @Length(2, 50)
  name: string;

  @IsString()
  @IsNotEmpty({ message: '菜单类型不能为空' })
  type: 'DIR' | 'MENU' | 'BUTTON';

  @IsString()
  @IsOptional()
  @Length(0, 200)
  path?: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  component?: string;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  icon?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  permission?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number = 0;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isCache?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;
}

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  component?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  permission?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

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

export class UpdateMenuSortDto {
  @IsInt({ each: true })
  @IsNotEmpty({ message: '菜单ID顺序不能为空' })
  menuIds: number[];
}
