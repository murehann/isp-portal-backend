import { Body, Controller, Get } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('userroles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  // TODO: if no more api endpoints are added here remove this controller, only here for debugging purposes for now
  @Get('')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAll() {
    return this.userRolesService.getAll();
  }
}
