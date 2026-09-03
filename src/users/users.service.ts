import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import * as argon2 from 'argon2';
import { AssignRoleDto } from './dto/assign-role-by-name.dto';
import { RolesService } from 'src/roles/roles.service';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly userRolesService: UserRolesService,
    private readonly rolesService: RolesService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    manager = this.usersRepository.manager,
  ) {
    const usersRepository = manager.getRepository(User);

    const { roleId, ...createUserData } = createUserDto;

    const role = await this.rolesService.findById(roleId);
    if (!role) throw new NotFoundException('Role not found!');

    const hashedPassword = await argon2.hash(createUserData.password);

    let newUser: User;

    try {
      newUser = await usersRepository.save(
        usersRepository.create({
          ...createUserData,
          password: hashedPassword,
        }),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Email already in use!');
      }
      throw error;
    }

    await this.userRolesService.assign(
      { userId: newUser.id, roleId: role.id },
      manager,
    );

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

    const role = await this.rolesService.findById(assignRoleDto.roleId);
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
