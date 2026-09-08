import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { CreateCustomerDto } from 'src/user-management/dto/create-customer.dto';
import { CreateAdminDto, CreateEmployeeDto } from './dto';
import { Roles } from 'src/common/decorators';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';
import { AuthTokenPayloadDto } from 'src/auth/dto/auth-token-payload.dto';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('customer')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createCustomer(
    @Request() req: { user: AuthTokenPayloadDto },
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    const managedById =
      req.user.currentRoleCode === 'SUPER_ADMIN'
        ? (createCustomerDto.managedById ?? req.user.sub)
        : req.user.sub;
    return this.userManagementService.createCustomer({
      ...createCustomerDto,
      managedById,
    });
  }

  @Post('admin')
  @Roles('SUPER_ADMIN')
  createAdmin(
    @Request() req: { user: AuthTokenPayloadDto },
    @Body() createAdminDto: CreateAdminDto,
  ) {
    const managedById = req.user.sub;
    return this.userManagementService.createAdmin({
      ...createAdminDto,
      managedById,
    });
  }

  @Post('employee')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createEmployee(
    @Request() req: { user: AuthTokenPayloadDto },
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    const managedById =
      req.user.currentRoleCode === 'SUPER_ADMIN'
        ? (createEmployeeDto.managedById ?? req.user.sub)
        : req.user.sub;
    return this.userManagementService.createEmployee({
      ...createEmployeeDto,
      managedById,
    });
  }

  @Patch(':userId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'CUSTOMER', 'EMPLOYEE')
  @UseGuards(UserOwnershipGuard)
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userManagementService.updateUser(userId, updateUserDto);
  }
}
