import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateAdminDto } from 'src/user-management/dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    return this.dataSource.transaction(async (manager) => {
      const { ...createUserDto } = createAdminDto;

      // create user
      const newUser = await this.usersService.create(createUserDto, manager);

      // assign role - setting roleId 3, this will be a seeded value it database, and immutable
      await this.userRolesService.assign(
        {
          userId: newUser.id,
          roleId: 3,
        },
        manager,
      );

      return {
        userData: newUser,
      };
    });
  }
}
