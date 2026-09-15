import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Subscriptions,
  SubscriptionsStatusEnum,
} from './entities/subscriptions.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PackagesService } from 'src/packages/packages.service';
import { InternetLogonService } from 'src/internet-logon/internet-logon.service';

@Injectable()
export class SubscriptionsService {
  private processingExpiredSubscriptions = false;

  constructor(
    @InjectRepository(Subscriptions)
    private readonly subscriptionsRepository: Repository<Subscriptions>,
    private readonly packagesService: PackagesService,
    private readonly internetLogonService: InternetLogonService,
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

  @Cron('0 0 * * *')
  private async processExpiredSubscriptions() {
    if (this.processingExpiredSubscriptions) return;
    this.processingExpiredSubscriptions = true;

    try {
      const now = new Date();
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');

      const expiredSubscriptions = await this.subscriptionsRepository
        .createQueryBuilder('subscription')
        .where('subscription.status = :status', {
          status: SubscriptionsStatusEnum.ACTIVE,
        })
        .andWhere('subscription.expireDate = :today', { today })
        .getMany();

      for (const subscription of expiredSubscriptions) {
        await this.subscriptionsRepository.manager.transaction(
          async (manager) => {
            const subscriptionsRepository =
              manager.getRepository(Subscriptions);

            const current = await subscriptionsRepository
              .createQueryBuilder('subscription')
              .where('subscription.id = :subscriptionId', {
                subscriptionId: subscription.id,
              })
              .andWhere('subscription.status = :status', {
                status: SubscriptionsStatusEnum.ACTIVE,
              })
              .setLock('pessimistic_write')
              .getOne();

            if (!current || !current.expireDate) {
              return;
            }

            const currentExpireDate = [
              current.expireDate.getFullYear(),
              String(current.expireDate.getMonth() + 1).padStart(2, '0'),
              String(current.expireDate.getDate()).padStart(2, '0'),
            ].join('-');

            if (currentExpireDate !== today) {
              return;
            }

            const internetLogon = await this.internetLogonService.findByUserId(
              current.userId,
              manager,
            );

            if (
              !internetLogon ||
              internetLogon.currentSubscriptionId !== current.id
            ) {
              return;
            }

            const shouldRenew =
              internetLogon.renewOnce || internetLogon.autoRenewEnabled;

            if (shouldRenew) {
              const packageEntity = await this.packagesService.findById(
                current.packageId,
                manager,
              );
              if (!packageEntity) {
                return;
              }

              const startDate = new Date(current.expireDate);
              const expireDate = new Date(startDate);
              expireDate.setDate(expireDate.getDate() + 30);

              const renewedSubscription = await subscriptionsRepository.save(
                subscriptionsRepository.create({
                  userId: current.userId,
                  packageId: current.packageId,
                  status: SubscriptionsStatusEnum.ACTIVE,
                  startDate,
                  expireDate,
                  subscriptionCost: packageEntity.price,
                }),
              );

              await this.internetLogonService.completeRenewal(
                current.userId,
                renewedSubscription.id,
                manager,
              );
            }

            current.status = SubscriptionsStatusEnum.EXPIRED;
            await subscriptionsRepository.save(current);
          },
        );
      }
    } finally {
      this.processingExpiredSubscriptions = false;
    }
  }
}
