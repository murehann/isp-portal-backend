import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async getAll() {
    const userRoles = await this.userRolesRepository.find({
      relations: {
        user: true,
        role: true,
      },
    });
    return userRoles.map((userRole) => {
      return {
        name: userRole.user.displayName,
        email: userRole.user.email,
        roleName: userRole.role.name,
      };
    });
  }

  async assign(
    assignRoleDto: AssignRoleDto,
    manager = this.userRolesRepository.manager,
  ) {
    const userRolesRepository = manager.getRepository(UserRole);
    try {
      return await userRolesRepository.save(
        userRolesRepository.create(assignRoleDto),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('User already has this role!');
      }
      throw error;
    }
  }

  findByUserId(userId: number) {
    return this.userRolesRepository
      .createQueryBuilder('userRole')
      .innerJoinAndSelect('userRole.role', 'role')
      .where('userRole.userId = :userId', { userId })
      .getMany();
  }
}
