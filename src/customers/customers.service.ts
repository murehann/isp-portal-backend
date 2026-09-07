import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from '../user-management/dto/create-customer.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { DataSource } from 'typeorm';
import { InternetLogonService } from 'src/internet-logon/internet-logon.service';
import { UserRolesService } from 'src/user-roles/user-roles.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly internetLogonService: InternetLogonService,
    private readonly userRolesService: UserRolesService,
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
}
