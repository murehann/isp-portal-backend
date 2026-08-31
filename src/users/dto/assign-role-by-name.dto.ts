import { IsRoleCode } from 'src/roles/decorators';
import { IsUsername } from 'src/users/decorators';

export class AssignRoleByNameDto {
  @IsUsername()
  username!: string;

  @IsRoleCode()
  roleCode!: string;
}
