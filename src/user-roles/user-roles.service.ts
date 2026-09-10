import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
        id: userRole.id,
        userId: userRole.user.id,
        name: userRole.user.displayName,
        email: userRole.user.email,
        roleId: userRole.role.id,
        roleName: userRole.role.name,
      };
    });
  }

  async assign(
    assignRoleDto: AssignRoleDto,
    manager = this.dataSource.manager,
  ) {
    const userRolesRepository = manager.getRepository(UserRole);

    const existingUserRole = await userRolesRepository
      .createQueryBuilder('userRole')
      .withDeleted()
      .setLock('pessimistic_write')
      .where('userRole.userId = :userId', { userId: assignRoleDto.userId })
      .andWhere('userRole.roleId = :roleId', { roleId: assignRoleDto.roleId })
      .getOne();

    if (existingUserRole) {
      if (existingUserRole.deletedAt) {
        existingUserRole.deletedAt = null;
        Object.assign(existingUserRole, assignRoleDto);
        const savedUserRole = await userRolesRepository.save(existingUserRole);

        return userRolesRepository.findOneOrFail({
          where: { id: savedUserRole.id },
          relations: {
            user: true,
            role: true,
          },
        });
      }
      throw new ConflictException('User already has this role!');
    }

    try {
      const savedUserrole = await userRolesRepository.save(
        userRolesRepository.create(assignRoleDto),
      );

      return userRolesRepository.findOneOrFail({
        where: { id: savedUserrole.id },
        relations: {
          user: true,
          role: true,
        },
      });
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
