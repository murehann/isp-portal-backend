import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';

@Module({
  imports: [UsersModule, UserRolesModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
