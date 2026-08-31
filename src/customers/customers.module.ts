import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([InternetLogon]), UsersModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [],
})
export class CustomersModule {}
