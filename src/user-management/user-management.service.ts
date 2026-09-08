import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import { CreateAdminDto, CreateCustomerDto, CreateEmployeeDto } from './dto';
import { AdminService } from 'src/admin/admin.service';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
    private readonly employeeService: EmployeeService,
  ) {}

  createCustomer(dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }

  createAdmin(dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  createEmployee(dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }
}
