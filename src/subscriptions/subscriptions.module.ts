import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { PackagesModule } from 'src/packages/packages.module';
import { InternetLogonModule } from 'src/internet-logon/internet-logon.module';
import { RadiusModule } from 'src/radius/radius.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscriptions]),
    PackagesModule,
    InternetLogonModule,
    RadiusModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
