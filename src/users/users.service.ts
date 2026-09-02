import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { Role } from 'src/roles/entities/role.entity';
import * as argon2 from 'argon2';
import { AssignRoleDto } from './dto/assign-role-by-name.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolessRepository: Repository<Role>,
    private readonly userRolesService: UserRolesService,
  ) {}

  async createUser(user: CreateUserDto) {
    const { roleId, ...createUserData } = user;

    const role = await this.rolessRepository.findOneBy({ id: roleId });
    if (!role) throw new BadRequestException('Invalid role code');

    const hashedPassword = await argon2.hash(createUserData.password);

    const createdUser = this.usersRepository.create({
      ...createUserData,
      password: hashedPassword,
    });
    const newUser = await this.usersRepository.save(createdUser);

    await this.userRolesService.assign({ userId: newUser.id, roleId: role.id });
    return {
      ...newUser,
      assignedRoleName: role.name,
    };
  }

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // returns null if no user found, used in auth
  async findByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) return null;

    const userRoles = await this.userRolesService.findByUserId(user.id);

    return {
      ...user,
      roles: userRoles.map((userRole) => userRole.role),
    };
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    const user = await this.usersRepository.findOne({
      select: {
        displayName: true,
      },
      where: {
        id: assignRoleDto.userId,
      },
    });
    if (!user) throw new NotFoundException('user not found');

    const role = await this.rolessRepository.findOne({
      select: {
        name: true,
      },
      where: {
        id: assignRoleDto.roleId,
      },
    });
    if (!role) throw new NotFoundException('role not found');

    const newUserRole = await this.userRolesService.assign({
      userId: assignRoleDto.userId,
      roleId: assignRoleDto.roleId,
    });

    return {
      id: newUserRole.id,
      name: user.displayName,
      role: role.name,
    };
  }
}
