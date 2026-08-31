import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { PackagesService } from 'src/packages/packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriptions]), PackagesService],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [],
})
export class SubscriptionsModule {}
