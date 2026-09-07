import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    manager = this.usersRepository.manager,
  ) {
    const usersRepository = manager.getRepository(User);
    const hashedPassword = await argon2.hash(createUserDto.password);

    try {
      return await usersRepository.save(
        usersRepository.create({
          ...createUserDto,
          password: hashedPassword,
        }),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Email already in use!');
      }
      throw error;
    }
  }

  // returns null if no user found, used in auth
  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  getAll() {
    return this.usersRepository.find();
  }
}
