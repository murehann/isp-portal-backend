import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Subscriptions,
  SubscriptionsStatusEnum,
} from './entities/subscriptions.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PackagesService } from 'src/packages/packages.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscriptions)
    private readonly subscriptionsRepository: Repository<Subscriptions>,
    private readonly packagesService: PackagesService,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    manager = this.subscriptionsRepository.manager,
  ) {
    const subscriptionsRepository = manager.getRepository(Subscriptions);
    const packageEntity = await this.packagesService.findById(
      createSubscriptionDto.packageId,
      manager,
    );

    if (!packageEntity) throw new NotFoundException(`Package not found!`);

    return await subscriptionsRepository.save(
      subscriptionsRepository.create({
        userId: createSubscriptionDto.userId,
        packageId: packageEntity.id,
      }),
    );
  }

  getAll() {
    return this.subscriptionsRepository.find();
  }

  findById(subscriptionId: number) {
    return this.subscriptionsRepository.findOneBy({
      id: subscriptionId,
    });
  }

  async activate(
    userId: number,
    subscriptionId: number,
    manager: EntityManager,
  ) {
    const subscriptionsRepository = manager.getRepository(Subscriptions);

    const subscription = await subscriptionsRepository
      .createQueryBuilder('subscription')
      .where('subscription.id = :subscriptionId', { subscriptionId })
      .andWhere('subscription.userId = :userId', { userId })
      .setLock('pessimistic_write')
      .getOne();
    if (!subscription) throw new NotFoundException('Subscription not found!');

    if (subscription.status === SubscriptionsStatusEnum.ACTIVE)
      throw new BadRequestException('Subscription already active');

    const subscribedPackage = await this.packagesService.findById(
      subscription.packageId,
      manager,
    );
    if (!subscribedPackage) throw new NotFoundException('Package not found!');

    const startDate = new Date();
    const expireDate = new Date(startDate);
    expireDate.setDate(expireDate.getDate() + 30);

    subscription.startDate = startDate;
    subscription.expireDate = expireDate;
    subscription.subscriptionCost = subscribedPackage.price;
    subscription.status = SubscriptionsStatusEnum.ACTIVE;

    return subscriptionsRepository.save(subscription);
  }
}
