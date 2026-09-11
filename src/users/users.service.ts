import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly userRolesService: UserRolesService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    manager = this.dataSource.manager,
  ) {
    const usersRepository = manager.getRepository(User);
    const hashedPassword = await argon2.hash(createUserDto.password);

    const existingUser = await usersRepository
      .createQueryBuilder('user')
      .withDeleted()
      .setLock('pessimistic_write')
      .where('user.email = :email', { email: createUserDto.email })
      .getOne();

    if (existingUser) {
      if (existingUser.deletedAt) {
        existingUser.deletedAt = null;
        Object.assign(existingUser, {
          ...createUserDto,
          password: hashedPassword,
        });
        return usersRepository.save(existingUser);
      }
      throw new ConflictException('User already exists!');
    }

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
  async findByEmail(email: string, manager?: EntityManager) {
    const usersRepository = manager
      ? manager.getRepository(User)
      : this.usersRepository;

    return usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number, manager = this.usersRepository.manager) {
    const usersRepository = manager.getRepository(User);
    return usersRepository.findOneBy({ id });
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found!');

    const userRoles = await this.userRolesService.findByUserId(userId);
    const roles = userRoles.map((userRole) => {
      return userRole.role.code;
    });

    return {
      userId,
      email: user.email,
      displayName: user.displayName,
      address: user.address,
      role: roles,
      managerId: user.managedById,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  getAll() {
    return this.usersRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const { displayName, address, password } = updateUserDto;

    if (
      displayName === undefined &&
      address === undefined &&
      password === undefined
    ) {
      throw new BadRequestException('Empty updates are not allowed!');
    }

    const updateData: Partial<User> = {};

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    if (password !== undefined) {
      updateData.password = await argon2.hash(password);
    }

    await this.usersRepository.update({ id }, updateData);
    return this.usersRepository.findOneByOrFail({ id });
  }

  async isManagedBy(targetUserId: number, managerId: number) {
    const managedUser = await this.usersRepository.findOneBy({
      id: targetUserId,
      managedById: managerId,
    });

    return !!managedUser;
  }
}
