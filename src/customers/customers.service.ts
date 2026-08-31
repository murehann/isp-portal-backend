import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(InternetLogon)
    private readonly internetLogonRepository: Repository<InternetLogon>,
    private readonly usersService: UsersService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { internetLogonData, ...createUserDto } = createCustomerDto;

    const user = await this.usersService.createUser(createUserDto);
    const internetLogon = this.internetLogonRepository.create({
      ...internetLogonData,
      userId: user.id,
      assignedIP: '10.0.0.2', // hardcoding for now
    });

    const savedInternetLogon =
      await this.internetLogonRepository.save(internetLogon);

    return {
      ...user,
      ...savedInternetLogon,
    };
  }
}
