import { Module } from '@nestjs/common';
import { UserRolesModule } from 'src/user-roles/user-roles.module';
import { UsersModule } from 'src/users/users.module';
import { EmployeeService } from './employee.service';

@Module({
  imports: [UsersModule, UserRolesModule],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
