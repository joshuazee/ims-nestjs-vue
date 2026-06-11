import { IsString, IsNotEmpty, Length, IsEmail, IsOptional, Matches, IsInt, Min, Max } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 50, { message: '用户名长度应在 3-50 位之间' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 50, { message: '密码长度应在 6-50 位之间' })
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token 不能为空' })
  refreshToken!: string;
}

export class TokenResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  refreshExpiresIn!: number;
}

export class UserInfoDto {
  id!: number;
  username!: string;
  nickname!: string | null;
  email!: string | null;
  phone!: string | null;
  avatar!: string | null;
  deptId!: number | null;
  deptName!: string | null;
  roles!: { id: number; name: string }[];
  permissions!: string[];
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 50)
  password!: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  nickname?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsInt()
  @IsOptional()
  deptId?: number;

  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  nickname?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsInt()
  @IsOptional()
  deptId?: number;

  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}

export class UpdateUserStatusDto {
  @IsInt()
  @Min(0)
  @Max(1)
  status!: number;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  password!: string;
}

export class AssignRolesDto {
  @IsInt({ each: true })
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleIds!: number[];
}

export class UserQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsInt()
  @IsOptional()
  deptId?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;

  page: number = 1;
  pageSize: number = 20;
}
