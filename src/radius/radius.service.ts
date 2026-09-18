import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RadiusCheck, RadiusReply } from './entities';
import { EntityManager, Repository } from 'typeorm';
import { CreateRadiusUserDto, AllowUserDto } from './dto';

@Injectable()
export class RadiusService {
  constructor(
    @InjectRepository(RadiusCheck)
    private readonly radiusCheckRepository: Repository<RadiusCheck>,

    @InjectRepository(RadiusReply)
    private readonly radiusReplyRepository: Repository<RadiusReply>,
  ) {}

  async createUser(
    dto: CreateRadiusUserDto,
    manager: EntityManager = this.radiusCheckRepository.manager,
  ) {
    const radiusCheckRepository = manager.getRepository(RadiusCheck);
    await radiusCheckRepository.insert({
      username: dto.username,
      attribute: 'Cleartext-Password',
      op: ':=',
      value: dto.password,
    });
  }

  async activate(
    dto: AllowUserDto,
    manager: EntityManager = this.radiusReplyRepository.manager,
  ) {
    const radiusReplyRepository = manager.getRepository(RadiusReply);
    const radiusCheckRepository = manager.getRepository(RadiusCheck);

    // Remove the reject rule
    await radiusCheckRepository.delete({
      username: dto.username,
      attribute: 'Auth-Type',
      op: ':=',
      value: 'Reject',
    });

    // Create or update the rate limit
    const upsertResult = await radiusReplyRepository.upsert(
      {
        username: dto.username,
        attribute: 'Mikrotik-Rate-Limit',
        op: ':=',
        value: `${dto.uploadMbps}M/${dto.downloadMbps}M`,
      },
      ['username', 'attribute'],
    );
    console.log(upsertResult);
  }

  async deactivate(
    username: string,
    manager: EntityManager = this.radiusCheckRepository.manager,
  ) {
    const radiusCheckRepository = manager.getRepository(RadiusCheck);

    // Create or update the reject rule
    await radiusCheckRepository.upsert(
      {
        username,
        attribute: 'Auth-Type',
        op: ':=',
        value: 'Reject',
      },
      ['username', 'attribute'],
    );
  }
}
