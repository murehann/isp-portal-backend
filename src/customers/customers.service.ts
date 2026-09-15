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
}
