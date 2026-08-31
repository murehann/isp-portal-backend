import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.createCustomer(createCustomerDto);
  }
}
