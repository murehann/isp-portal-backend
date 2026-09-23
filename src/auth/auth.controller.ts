import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators';
import { type Response } from 'express';
import {
  type AuthenticatedRequest,
  type RequestWithRefreshCookie,
} from 'src/common/Types';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginResponseDto } from './dto/login-response.dto';

const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 * 7;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth',
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, ...rest } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return rest;
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('refresh')
  async refresh(
    @Body() body: RefreshDto,
    @Req() req: RequestWithRefreshCookie,
  ) {
    const refreshToken: string | undefined = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('No refresh token.');

    return this.authService.refresh(body.currentRoleCode, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user.sub;

    if (refreshToken && userId) {
      await this.authService.logout(userId, refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/auth' });
    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('switch-role')
  async switchRole(
    @Req() req: AuthenticatedRequest,
    @Body() switchRoleDto: SwitchRoleDto,
  ) {
    return this.authService.switchRole({
      userId: req.user.sub,
      currentRoleCode: req.user.currentRoleCode,
      roleCode: switchRoleDto.roleCode,
    });
  }
}
