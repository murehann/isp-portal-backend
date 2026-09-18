import { Module } from '@nestjs/common';
import { RadiusService } from './radius.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RadiusCheck, RadiusPostAuth, RadiusReply } from './entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RadiusCheck, RadiusReply, RadiusPostAuth]),
  ],
  providers: [RadiusService],
  exports: [RadiusService],
})
export class RadiusModule {}
