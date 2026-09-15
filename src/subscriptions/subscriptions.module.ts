import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { PackagesModule } from 'src/packages/packages.module';
import { InternetLogon } from 'src/internet-logon/entities/internet-logon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscriptions, InternetLogon]),
    PackagesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
