import { IsIdentifierCode } from 'src/common/decorators';
import { IsUsername } from 'src/users/decorators';

export class AssignRoleByNameDto {
  @IsUsername()
  username!: string;

  @IsIdentifierCode()
  roleCode!: string;
}
