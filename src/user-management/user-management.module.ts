import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { CustomersModule } from 'src/customers/customers.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [CustomersModule, AdminModule],
  providers: [UserManagementService],
  controllers: [UserManagementController],
})
export class UserManagementModule {}
