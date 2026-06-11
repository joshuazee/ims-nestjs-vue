import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDeptDto {
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  @Length(2, 50)
  name!: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  code?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  leader?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number = 0;
}

export class UpdateDeptDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  code?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  leader?: string;

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
