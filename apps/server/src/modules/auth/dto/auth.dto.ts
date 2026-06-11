import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 50, { message: '用户名长度应在 3-50 位之间' })
  username!: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 50, { message: '密码长度应在 6-50 位之间' })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token' })
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
