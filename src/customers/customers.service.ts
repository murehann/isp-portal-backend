import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { generatePassword } from './util';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
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

      const internetLogonData = {
        internetLogonUsername: user.email.split('@')[0].slice(0, 6) + user.id,
        internetLogonPassword: generatePassword(),
      };

      const internetLogon = await manager.save(
        manager.create(InternetLogon, {
          ...internetLogonData,
          userId: user.id,
          currentSubscriptionId: currentSubscription.id,
        }),
      );

      return {
        ...user,
        ...internetLogon,
      };
    });
  }
}
