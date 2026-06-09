import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateDictTypeDto {
  @IsString()
  @IsNotEmpty({ message: '字典名称不能为空' })
  @Length(2, 50)
  name: string;

  @IsString()
  @IsNotEmpty({ message: '字典编码不能为空' })
  @Length(2, 50)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, { message: '字典编码只能包含字母、数字和下划线' })
  code: string;
}

export class UpdateDictTypeDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

export class CreateDictItemDto {
  @IsInt()
  @IsNotEmpty({ message: '字典类型ID不能为空' })
  dictTypeId: number;

  @IsString()
  @IsNotEmpty({ message: '标签不能为空' })
  @Length(1, 50)
  label: string;

  @IsString()
  @IsNotEmpty({ message: '值不能为空' })
  @Length(1, 50)
  value: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number = 0;
}

export class UpdateDictItemDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  label?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  value?: string;

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
