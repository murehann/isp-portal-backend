import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AssignRoleByNameDto } from './dto/assign-role-by-name.dto';
import { Public } from 'src/common/decorators';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // for testing purposes, no need for now
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAll() {
    return this.usersService.getAll();
  }

  @Post()
  // TODO: remove this public here when done testing and uncomment the @Roles() line below it
  @Public()
  // @Roles('ADMIN', 'SUPER_ADMIN')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('assign')
  @Roles('SUPER_ADMIN')
  assignRoleByName(@Body() assignRoleByName: AssignRoleByNameDto) {
    return this.usersService.assignRoleByName(assignRoleByName);
  }
}
