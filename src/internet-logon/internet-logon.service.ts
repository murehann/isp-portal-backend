import { ConflictException, Injectable } from '@nestjs/common';
import { CreateInternetLogonDto } from './dto/create-internet-logon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InternetLogon } from './entities/internet-logon.entity';
import { Repository } from 'typeorm';
import { generatePassword } from 'src/internet-logon/util';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class InternetLogonService {
  constructor(
    @InjectRepository(InternetLogon)
    private readonly internetLogonRepository: Repository<InternetLogon>,
  ) {}

  async createInternetLogon(
    createInternetLogonDto: CreateInternetLogonDto,
    manager = this.internetLogonRepository.manager,
  ): Promise<InternetLogon> {
    const internetLogonData = {
      internetLogonUsername:
        createInternetLogonDto.userEmail.split('@')[0].slice(0, 6) +
        createInternetLogonDto.userId,
      internetLogonPassword: generatePassword(),
    };

    try {
      const newInternetLogon = await manager.save(
        manager.create(InternetLogon, {
          ...internetLogonData,
          userId: createInternetLogonDto.userId,
          currentSubscriptionId: createInternetLogonDto.currentSubscriptionId,
        }),
      );

      return newInternetLogon;
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('User already has Internet Logon!');
      }
      throw error;
    }
  }
}
