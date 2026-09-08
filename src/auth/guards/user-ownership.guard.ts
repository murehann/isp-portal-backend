import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthTokenPayloadDto } from '../dto/auth-token-payload.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: AuthTokenPayloadDto; params: { userId: number } } =
      context.switchToHttp().getRequest();

    const targetUserId = Number(request.params.userId);
    const actor = request.user;

    // return false if invalid target userid
    if (!Number.isInteger(targetUserId)) {
      return false;
    }

    // super admin always passes ownership check
    if (request.user.currentRoleCode === 'SUPER_ADMIN') return true;

    // user can access endpoints related to themself (after role guard authorizes)
    if (actor.sub === targetUserId) return true;

    // if user isnt targeting themself, is not currently SUPER_ADMIN or ADMIN, we dont allow
    if (actor.currentRoleCode !== 'ADMIN') {
      return false;
    }

    return this.usersService.isManagedBy(targetUserId, actor.sub);
  }
}
