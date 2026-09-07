import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UsersModule } from 'src/users/users.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { InternetLogonModule } from 'src/internet-logon/internet-logon.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';

@Module({
  imports: [
    UsersModule,
    SubscriptionsModule,
    InternetLogonModule,
    UserRolesModule,
  ],
  controllers: [],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
