import { IsInt, Min } from 'class-validator';
import { IsIdentifierCode, IsName } from 'src/common/decorators';

export class CreateRoleDto {
  @IsName()
  name!: string;

  @IsIdentifierCode()
  code!: string;

  @IsInt()
  @Min(0)
  level!: number;
}
