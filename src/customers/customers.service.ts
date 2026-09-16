import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from '../user-management/dto/create-customer.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { DataSource } from 'typeorm';
import { InternetLogonService } from 'src/internet-logon/internet-logon.service';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { InitializeCustomerDto } from 'src/user-management/dto';
import { PackagesService } from 'src/packages/packages.service';
import { UpdateInternetLogonDto } from '../internet-logon/dto/update-internet-logon.dto';
import { SubscriptionsStatusEnum } from 'src/subscriptions/entities/subscriptions.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly internetLogonService: InternetLogonService,
    private readonly userRolesService: UserRolesService,
    private readonly packagesService: PackagesService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { packageId, ...createUserDto } = createCustomerDto;

    return this.dataSource.transaction(async (manager) => {
      // create user
      const newUser = await this.usersService.create(createUserDto, manager);

      // assign role - setting roleId 2, this will be a seeded value it database, and immutable
      await this.userRolesService.assign(
        {
          userId: newUser.id,
          roleId: 2,
        },
        manager,
      );

      // creat subscription
      const newSubscription = await this.subscriptionsService.create(
        {
          userId: newUser.id,
          packageId,
        },
        manager,
      );

      // create internet logon
      const newInternetLogon = await this.internetLogonService.create(
        {
          userId: newUser.id,
          userEmail: newUser.email,
          currentSubscriptionId: newSubscription.id,
        },
        manager,
      );

      return {
        userData: newUser,
        subscriptionData: newSubscription,
        internetLogonData: newInternetLogon,
      };
    });
  }

  async initializeCustomer(
    userId: number,
    initializeCustomerDto: InitializeCustomerDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // check if valid user
      const user = await this.usersService.findById(userId, manager);
      if (!user) throw new NotFoundException('User does not exist!');

      // create new subscription
      const newSubscription = await this.subscriptionsService.create(
        {
          userId,
          packageId: initializeCustomerDto.packageId,
        },
        manager,
      );

      // assign role - setting roleId 2, this will be a seeded value it database, and immutable
      await this.userRolesService.assign(
        {
          userId,
          roleId: 2,
        },
        manager,
      );

      const internetLogon = await this.internetLogonService.create(
        {
          userId: userId,
          userEmail: user.email,
          currentSubscriptionId: newSubscription.id,
        },
        manager,
      );

      return {
        internetLogonData: internetLogon,
        subscriptionData: newSubscription,
      };
    });
  }

  async getCustomer(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found!');

    const internetLogon = await this.internetLogonService.findByUserId(userId);
    if (!internetLogon) throw new NotFoundException('Customer does not exist!');

    const currentSubscription = await this.subscriptionsService.findById(
      internetLogon.currentSubscriptionId,
    );
    if (!currentSubscription)
      throw new NotFoundException('Subscription data not found!');

    const currentPackage = await this.packagesService.findById(
      currentSubscription.packageId,
    );
    if (!currentPackage) throw new NotFoundException('Package not found!');

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        address: user.address,
      },
      internetLogon: {
        id: internetLogon.id,
        username: internetLogon.internetLogonUsername,
        password: internetLogon.internetLogonPassword,
        connectionStatus: internetLogon.status,
        registeredMAC: internetLogon.registeredDeviceMAC,
        renewOnce: internetLogon.renewOnce,
        autoRenew: internetLogon.autoRenewEnabled,
      },
      subscription: {
        id: currentSubscription.id,
        status: currentSubscription.status,
        startDate: currentSubscription.startDate,
        expireDate: currentSubscription.expireDate,
        package: {
          id: currentPackage.id,
          name: currentPackage.name,
          downloadMbps: currentPackage.downloadBandwidthMbps,
          uploadMbps: currentPackage.uploadBandwidthMbps,
          price: currentPackage.price,
        },
      },
    };
  }

  async updateInternetLogon(userId: number, dto: UpdateInternetLogonDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found!');

    return this.internetLogonService.updateInternetLogon(userId, dto);
  }

  async resetMAC(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found!');

    return this.internetLogonService.resetMAC(userId);
  }

  async activateSubscription(userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.findById(userId, manager);
      if (!user) throw new NotFoundException('User not found!');

      const internetLogon = await this.internetLogonService.findByUserId(
        userId,
        manager,
      );
      if (!internetLogon)
        throw new NotFoundException('Customer data not found!');

      const currentSubscriptionId = internetLogon.currentSubscriptionId;

      const currentSubscription = await this.subscriptionsService.findById(
        currentSubscriptionId,
        manager,
      );
      if (!currentSubscription)
        throw new NotFoundException('Subscription data not found!');

      if (currentSubscription.status === SubscriptionsStatusEnum.EXPIRED) {
        const newSubscription = await this.subscriptionsService.create(
          {
            userId,
            packageId: currentSubscription.packageId,
          },
          manager,
        );

        const activatedSubscription = await this.subscriptionsService.activate(
          userId,
          newSubscription.id,
          manager,
        );

        await this.internetLogonService.setCurrentSubscription(
          userId,
          activatedSubscription.id,
          manager,
        );

        return activatedSubscription;
      }

      return this.subscriptionsService.activate(
        userId,
        currentSubscriptionId,
        manager,
      );
    });
  }

  async renewSubscription(userId: number) {
    const internetLogon = await this.internetLogonService.setRenewOnce(
      userId,
      true,
    );

    return {
      userId,
      currentSubscriptionId: internetLogon.currentSubscriptionId,
      renewOnce: internetLogon.renewOnce,
      autoRenewEnabled: internetLogon.autoRenewEnabled,
    };
  }

  async setAutoRenew(userId: number, enabled: boolean) {
    const internetLogon = await this.internetLogonService.setAutoRenew(
      userId,
      enabled,
    );

    return {
      userId,
      currentSubscriptionId: internetLogon.currentSubscriptionId,
      renewOnce: internetLogon.renewOnce,
      autoRenewEnabled: internetLogon.autoRenewEnabled,
    };
  }

  async changeSubscriptionPackage(userId: number, packageId: number) {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.findById(userId, manager);
      if (!user) throw new NotFoundException('User not found!');

      const internetLogon = await this.internetLogonService.findByUserId(
        userId,
        manager,
      );
      if (!internetLogon)
        throw new NotFoundException('Customer data not found!');

      const currentSubscription =
        await this.subscriptionsService.findCurrentByUserId(
          userId,
          internetLogon.currentSubscriptionId,
          manager,
        );
      if (!currentSubscription)
        throw new NotFoundException('Subscription data not found!');

      const requestedPackage = await this.packagesService.findById(
        packageId,
        manager,
      );
      if (!requestedPackage) throw new NotFoundException('Package not found!');

      const previousSubscriptionId = currentSubscription.id;
      let subscription = currentSubscription;

      if (currentSubscription.status === SubscriptionsStatusEnum.INACTIVE) {
        subscription = await this.subscriptionsService.updatePackage(
          currentSubscription,
          requestedPackage.id,
          manager,
        );
      } else {
        if (currentSubscription.status === SubscriptionsStatusEnum.ACTIVE) {
          await this.subscriptionsService.deactivate(
            currentSubscription,
            manager,
          );
        }

        const newSubscription = await this.subscriptionsService.create(
          { userId, packageId: requestedPackage.id },
          manager,
        );
        subscription = await this.subscriptionsService.activate(
          userId,
          newSubscription.id,
          manager,
        );
        await this.internetLogonService.setCurrentSubscription(
          userId,
          subscription.id,
          manager,
        );
      }

      return {
        userId,
        subscriptionId: subscription.id,
        previousSubscriptionId,
        status: subscription.status,
        startDate: subscription.startDate,
        expireDate: subscription.expireDate,
        package: {
          id: requestedPackage.id,
          name: requestedPackage.name,
          downloadMbps: requestedPackage.downloadBandwidthMbps,
          uploadMbps: requestedPackage.uploadBandwidthMbps,
          price: requestedPackage.price,
        },
        internetLogon: {
          id: internetLogon.id,
          username: internetLogon.internetLogonUsername,
          password: internetLogon.internetLogonPassword,
          status: internetLogon.status,
          registeredMAC: internetLogon.registeredDeviceMAC,
          renewOnce: internetLogon.renewOnce,
          autoRenewEnabled: internetLogon.autoRenewEnabled,
          currentSubscriptionId: subscription.id,
        },
        changedAt: new Date().toISOString(),
      };
    });
  }
}
