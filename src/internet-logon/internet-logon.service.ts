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

  async create(
    createInternetLogonDto: CreateInternetLogonDto,
    manager = this.internetLogonRepository.manager,
  ): Promise<InternetLogon> {
    const internetLogonData = {
      internetLogonUsername:
        createInternetLogonDto.userEmail.split('@')[0].slice(0, 6) +
        createInternetLogonDto.userId,
      internetLogonPassword: generatePassword(),
    };

    const internetLogonRepository = manager.getRepository(InternetLogon);

    const existingInternetLogon = await internetLogonRepository
      .createQueryBuilder('internetLogon')
      .withDeleted()
      .setLock('pessimistic_write')
      .where('internetLogon.userId = :userId', {
        userId: createInternetLogonDto.userId,
      })
      .andWhere(
        'internetLogon.internetLogonUsername = :internetLogonUsername',
        {
          internetLogonUsername: internetLogonData.internetLogonUsername,
        },
      )
      .getOne();

    if (existingInternetLogon) {
      if (existingInternetLogon.deletedAt) {
        existingInternetLogon.deletedAt = null;
        Object.assign(existingInternetLogon, {
          ...internetLogonData,
          userId: createInternetLogonDto.userId,
          currentSubscriptionId: createInternetLogonDto.currentSubscriptionId,
        });
        return internetLogonRepository.save(existingInternetLogon);
      }
      throw new ConflictException('User already has Internet Logon!');
    }

    try {
      return await internetLogonRepository.save(
        internetLogonRepository.create({
          ...internetLogonData,
          userId: createInternetLogonDto.userId,
          currentSubscriptionId: createInternetLogonDto.currentSubscriptionId,
        }),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('User already has Internet Logon!');
      }
      throw error;
    }
  }

  async findByUserId(
    userId: number,
    manager = this.internetLogonRepository.manager,
  ): Promise<InternetLogon | null> {
    const internetLogonRepository = manager.getRepository(InternetLogon);
    return internetLogonRepository.findOneBy({
      userId,
    });
  }
}
