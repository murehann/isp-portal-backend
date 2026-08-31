import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userRoleService: UserRolesService,
  ) {}
  // TODO: implement password hash comparison
  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.findByUsername(username);

    if (!user) throw new UnauthorizedException('Invalid Username or Password!');

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword)
      throw new UnauthorizedException('Invalid Username  or Password!');

    const currentRole = user.roles.reduce((lowestLevelRole, role) =>
      lowestLevelRole.level < role.level ? lowestLevelRole : role,
    ).code;

    const tokenPayload = {
      sub: user.id,
      username: user.username,
      currentRole,
    };

    return {
      ...tokenPayload,
      accessToken: await this.jwtService.signAsync(tokenPayload),
    };
  }
}
