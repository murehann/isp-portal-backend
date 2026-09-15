import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'src/common/decorators';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';
import { UpdateInternetLogonDto } from '../internet-logon/dto/update-internet-logon.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Get('/:userId')
  getCustomer(@Param('userId', ParseIntPipe) userId: number) {
    return this.customersService.getCustomer(userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Patch('/:userId/internet-logon')
  updateInternetLogon(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateInternetLogonDto,
  ) {
    return this.customersService.updateInternetLogon(userId, dto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Patch(':userId/mac/reset')
  resetMAC(@Param('userId', ParseIntPipe) userId: number) {
    return this.customersService.resetMAC(userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Patch(':userId/subscription/activate')
  activateSubscription(@Param('userId', ParseIntPipe) userId: number) {
    return this.customersService.activateSubscription(userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(UserOwnershipGuard)
  @Post(':userId/subscription/renew')
  renewSubscription(@Param('userId', ParseIntPipe) userId: number) {
    return this.customersService.renewSubscription(userId);
  }
}
