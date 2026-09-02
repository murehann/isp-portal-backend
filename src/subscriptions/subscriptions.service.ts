import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PackagesService } from 'src/packages/packages.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscriptions)
    private readonly subscriptionsRepository: Repository<Subscriptions>,
    private readonly packagesService: PackagesService,
  ) {}

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    const packageEntity = await this.packagesService.getById(
      createSubscriptionDto.packageId,
    );

    if (!packageEntity) throw new NotFoundException(`Package not found!`);

    return await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        userId: createSubscriptionDto.userId,
        packageId: packageEntity.id,
      }),
    );
  }
}
