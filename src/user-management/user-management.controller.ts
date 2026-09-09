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
import { type AuthenticatedRequest } from 'src/common/Types';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('customer')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createCustomer(
    @Request() req: AuthenticatedRequest,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.userManagementService.createCustomer(createCustomerDto, req);
  }

  @Post('admin')
  @Roles('SUPER_ADMIN')
  createAdmin(
    @Request() req: AuthenticatedRequest,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    return this.userManagementService.createAdmin(createAdminDto, req);
  }

  @Post('employee')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createEmployee(
    @Request() req: AuthenticatedRequest,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.userManagementService.createEmployee(createEmployeeDto, req);
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
