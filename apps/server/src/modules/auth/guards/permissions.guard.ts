import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../../common/decorators/roles.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('无权限访问');
    }

    const userPermissions = await this.getUserPermissions(userId);
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('无权限访问');
    }

    return true;
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
