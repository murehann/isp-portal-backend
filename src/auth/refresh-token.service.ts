import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { createHash } from 'crypto';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async create(
    userId: number,
    rawToken: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hashToken(rawToken);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({ userId, tokenHash, expiresAt }),
    );
  }

  async findValid(
    userId: number,
    rawToken: string,
  ): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(rawToken);

    return this.refreshTokenRepository.findOne({
      where: {
        userId,
        tokenHash,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revoke(userId: number, rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);

    await this.refreshTokenRepository.update(
      { userId, tokenHash },
      { revoked: true },
    );
  }
}
