import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import { CreateAdminDto, CreateCustomerDto, CreateEmployeeDto } from './dto';
import { AdminService } from 'src/admin/admin.service';
import { EmployeeService } from 'src/employee/employee.service';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
    private readonly employeeService: EmployeeService,
    private readonly usersService: UsersService,
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

  updateUser(userId: number, dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }
}
