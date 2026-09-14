import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'src/common/decorators';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Get('/:userId')
  getCustomer(@Param('userId', ParseIntPipe) userId: number) {
    return this.customersService.getCustomer(userId);
  }
}
