import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateEmployeeDto } from 'src/user-management/dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const { ...createUserDto } = createEmployeeDto;

    return this.dataSource.transaction(async (manager) => {
      const newUser = await this.usersService.create(createUserDto, manager);

      // assign role - setting roleId 4, this will be a seeded value it database, and immutable
      await this.userRolesService.assign(
        { userId: newUser.id, roleId: 4 },
        manager,
      );

      return {
        userData: newUser,
      };
    });
  }
}
