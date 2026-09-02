import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { generatePassword } from './util';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(InternetLogon)
    private readonly internetLogonRepository: Repository<InternetLogon>,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { packageId, ...createUserDto } = createCustomerDto;

    const user = await this.usersService.createUser(createUserDto);
    const currentSubscription =
      await this.subscriptionsService.createSubscription({
        userId: user.id,
        packageId,
      });

    const internetLogonData = {
      internetLogonUsername: user.email.split('@')[0].slice(0, 6) + user.id,
      internetLogonPassword: generatePassword(),
    };

    const internetLogon = this.internetLogonRepository.create({
      ...internetLogonData,
      userId: user.id,
      currentSubscriptionId: currentSubscription.id,
    });

    const savedInternetLogon =
      await this.internetLogonRepository.save(internetLogon);

    return {
      ...user,
      ...savedInternetLogon,
    };
  }
}
