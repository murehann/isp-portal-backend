import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { CustomersModule } from 'src/customers/customers.module';
import { AdminModule } from 'src/admin/admin.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    CustomersModule,
    EmployeeModule,
    AdminModule,
    UsersModule,
    AuthModule,
  ],
  providers: [UserManagementService],
  controllers: [UserManagementController],
})
export class UserManagementModule {}
