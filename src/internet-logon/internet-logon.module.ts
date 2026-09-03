import { Module } from '@nestjs/common';
import { InternetLogonService } from './internet-logon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternetLogon])],
  controllers: [],
  providers: [InternetLogonService],
  exports: [InternetLogonService],
})
export class InternetLogonModule {}
