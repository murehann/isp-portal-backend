import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/login-response.dto';
import * as argon2 from 'argon2';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { RefreshTokensService } from './refresh-token.service';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';
import { SwitchRoleResponseDto } from './dto/switch-role-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userRolesService: UserRolesService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly configService: ConfigService,
  ) {}

  private resolveInitialRoleCode(userRoles: UserRole[]): string {
    if (userRoles.length === 0)
      throw new UnauthorizedException('User has no assigned role!');

    return userRoles
      .map((userRole) => userRole.role)
      .reduce((lowestLevelRole, role) =>
        lowestLevelRole.level < role.level ? lowestLevelRole : role,
      ).code;
  }

  private async issueRefreshToken(userId: number): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '1d',
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await this.refreshTokensService.create(userId, refreshToken, expiresAt);

    return refreshToken;
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid email or password!');

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword)
      throw new UnauthorizedException('Invalid email or password!');

    const userRoles = await this.userRolesService.findByUserId(user.id);
    const currentRoleCode = this.resolveInitialRoleCode(userRoles);

    const tokenPayload = {
      sub: user.id,
      currentRoleCode,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const refreshToken = await this.issueRefreshToken(user.id);

    return { ...tokenPayload, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: RefreshTokenPayloadDto;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const stored = await this.refreshTokensService.findValid(
      payload.sub,
      refreshToken,
    );
    if (!stored)
      throw new UnauthorizedException(
        'Refresh token revoked or not recognized.',
      );

    const userRoles = await this.userRolesService.findByUserId(payload.sub);
    const currentRoleCode = this.resolveInitialRoleCode(userRoles);

    const accessToken = await this.jwtService.signAsync({
      sub: payload.sub,
      currentRoleCode,
    });

    return { accessToken };
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    await this.refreshTokensService.revoke(userId, refreshToken);
  }

  async switchRole(dto: {
    userId: number;
    currentRoleCode: string;
    roleCode: string;
  }): Promise<SwitchRoleResponseDto> {
    if (dto.currentRoleCode === dto.roleCode)
      throw new BadRequestException('Already signedin with this role!');

    const userRoles = await this.userRolesService.findByUserId(dto.userId);

    const isAssignedRole = userRoles.some(
      (userRole) => userRole.role.code === dto.roleCode,
    );

    if (!isAssignedRole)
      throw new UnauthorizedException('Role not assigned to this user.');

    const accessToken = await this.jwtService.signAsync({
      sub: dto.userId,
      currentRoleCode: dto.roleCode,
    });

    return { currentRoleCode: dto.roleCode, accessToken };
  }
}
