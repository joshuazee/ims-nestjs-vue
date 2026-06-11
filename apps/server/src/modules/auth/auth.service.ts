import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, TokenResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh Token 已过期');
    }

    // 删除旧 Token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user);
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        dept: true,
        roles: { include: { role: true } },
      },
    });

    if (!user) return null;

    const permissions = await this.getUserPermissions(user.id);

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      deptId: user.deptId,
      deptName: user.dept?.name || null,
      status: user.status,
      roles: user.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
      permissions,
    };
  }

  private async generateTokens(user: any): Promise<TokenResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((ur: any) => ur.role.id) || [],
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES || '7200'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: process.env.JWT_SECRET || 'sss-ims-platform-jwt-secret-key-2026',
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES || '604800'),
      },
    );

    // 存储 Refresh Token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES || '604800') * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES || '7200'),
      refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES || '604800'),
    };
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            menus: {
              include: { menu: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    userRoles.forEach((ur) => {
      ur.role.menus.forEach((rm) => {
        if (rm.menu.permission) {
          permissions.add(rm.menu.permission);
        }
      });
    });

    return Array.from(permissions);
  }
}
