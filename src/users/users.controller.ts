import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';
import { type AuthenticatedRequest } from 'src/common/Types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAll(@Request() request: AuthenticatedRequest) {
    return this.usersService.getAll(request.user);
  }

  @Get(':userId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'EMPLOYEE')
  @UseGuards(UserOwnershipGuard)
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.getProfile(userId);
  }
}
