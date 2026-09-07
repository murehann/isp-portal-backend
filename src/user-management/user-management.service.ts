import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import { CreateAdminDto, CreateCustomerDto } from './dto';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
  ) {}

  createCustomer(dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }

  createAdmin(dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }
}
