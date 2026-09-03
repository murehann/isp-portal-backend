import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { UsersModule } from 'src/users/users.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { InternetLogonModule } from 'src/internet-logon/internet-logon.module';

@Module({
  imports: [UsersModule, SubscriptionsModule, InternetLogonModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [],
})
export class CustomersModule {}
