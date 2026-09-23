import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchRoleDto {
  @IsString()
  @IsNotEmpty()
  roleCode!: string;
}
