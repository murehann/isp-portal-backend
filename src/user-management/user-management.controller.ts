import { Body, Controller, Post } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { CreateCustomerDto } from 'src/user-management/dto/create-customer.dto';
import { CreateAdminDto } from './dto';
import { Roles } from 'src/common/decorators';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('customer')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.userManagementService.createCustomer(createCustomerDto);
  }

  @Post('admin')
  @Roles('ADMIN', 'SUPER_ADMIN')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.userManagementService.createAdmin(createAdminDto);
  }
}
