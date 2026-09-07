import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import { CreateCustomerDto } from './dto';

@Injectable()
export class UserManagementService {
  constructor(private readonly customersService: CustomersService) {}

  createCustomer(dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }
}
