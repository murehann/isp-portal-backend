import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request & {
      user: { sub: number; currentRoleCode: string };
    } = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('missing valid request data!');
    if (!user.currentRoleCode)
      throw new ForbiddenException('user has no roles!');

    if (!requiredRoles.includes(user.currentRoleCode))
      throw new ForbiddenException(
        'you donot have permission to access this resource',
      );

    return true;
  }
}
