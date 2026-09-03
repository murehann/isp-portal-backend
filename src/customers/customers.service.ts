import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { DataSource } from 'typeorm';
import { InternetLogonService } from 'src/internet-logon/internet-logon.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly internetLogonService: InternetLogonService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { packageId, ...createUserDto } = createCustomerDto;

    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.createUser(createUserDto, manager);
      const currentSubscription =
        await this.subscriptionsService.createSubscription(
          {
            userId: user.id,
            packageId,
          },
          manager,
        );

      const internetLogon = await this.internetLogonService.createInternetLogon(
        {
          userId: user.id,
          userEmail: user.email,
          currentSubscriptionId: currentSubscription.id,
        },
        manager,
      );

      return {
        ...user,
        ...internetLogon,
      };
    });
  }
}
