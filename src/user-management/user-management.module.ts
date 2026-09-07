import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [CustomersModule],
  providers: [UserManagementService],
  controllers: [UserManagementController],
})
export class UserManagementModule {}
