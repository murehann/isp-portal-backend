import { IsInt, Min } from 'class-validator';
import { IsRoleCode, IsRoleName } from '../decorators';

export class CreateRoleDto {
  @IsRoleName({
    message:
      'role name must contain at least one English letter and can only contain English letters and _',
  })
  name!: string;

  @IsRoleCode({
    message:
      'role code must contain at least one capital English letter and can only contain Capital English letters and _',
  })
  code!: string;

  @IsInt()
  @Min(0)
  level!: number;
}
