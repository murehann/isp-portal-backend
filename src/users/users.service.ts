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
import { AssignRoleByNameDto } from './dto/assign-role-by-name.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolessRepository: Repository<Role>,
    private readonly userRolesService: UserRolesService,
  ) {}

  async createUser(user: CreateUserDto) {
    const { roleCode, ...createUserData } = user;

    const role = await this.rolessRepository.findOneBy({ code: roleCode });
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
      assignedRole: role.code,
    };
  }

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // returns null if no user found, used in auth
  async findByUsername(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) return null;

    const userRoles = await this.userRolesService.findByUserId(user.id);

    return {
      ...user,
      roles: userRoles.map((userRole) => userRole.role),
    };
  }

  async assignRoleByName(assignRoleByNameDto: AssignRoleByNameDto) {
    const user = await this.usersRepository.findOne({
      select: {
        id: true,
      },
      where: {
        username: assignRoleByNameDto.username,
      },
    });
    if (!user) throw new NotFoundException('user not found');

    const role = await this.rolessRepository.findOne({
      select: {
        id: true,
      },
      where: {
        code: assignRoleByNameDto.roleCode,
      },
    });
    if (!role) throw new NotFoundException('role not found');

    const newUserRole = await this.userRolesService.assign({
      userId: user.id,
      roleId: role.id,
    });

    return {
      id: newUserRole.id,
      ...assignRoleByNameDto,
    };
  }
}
