import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  // TODO: implement password hash comparison
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid email or password!');

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword)
      throw new UnauthorizedException('Invalid email or password!');

    const currentRoleCode = user.roles.reduce((lowestLevelRole, role) =>
      lowestLevelRole.level < role.level ? lowestLevelRole : role,
    ).code;

    const tokenPayload = {
      sub: user.id,
      currentRoleCode,
    };

    return {
      ...tokenPayload,
      accessToken: await this.jwtService.signAsync(tokenPayload),
    };
  }
}
