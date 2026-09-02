import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { InjectRepository } from '@nestjs/typeorm';

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

  assign(assignRoleDto: AssignRoleDto) {
    const newUserRole = this.userRolesRepository.create(assignRoleDto);
    return this.userRolesRepository.save(newUserRole);
  }

  findByUserId(userId: number) {
    return this.userRolesRepository
      .createQueryBuilder('userRole')
      .innerJoinAndSelect('userRole.role', 'role')
      .where('userRole.userId = :userId', { userId })
      .getMany();
  }
}
