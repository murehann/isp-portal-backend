import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UsersModule } from 'src/users/users.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { InternetLogonModule } from 'src/internet-logon/internet-logon.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';
import { CustomersController } from './customers.controller';
import { PackagesModule } from 'src/packages/packages.module';

@Module({
  imports: [
    UsersModule,
    SubscriptionsModule,
    InternetLogonModule,
    UserRolesModule,
    PackagesModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
