import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { IsUsername } from '../decorators/is-username.decorator';
import { IsIdentifierCode, IsName } from 'src/common/decorators';

export class CreateUserDto {
  @IsUsername({
    message: 'Username can only contain English letters, numbers, and _',
  })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/\d/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/[@$!%*?&._-]/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @IsName()
  displayName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9,\-. ]+$/, {
    message:
      'Address can only contain English letters, numbers, "-", ",", and "."',
  })
  address!: string;

  @IsIdentifierCode()
  roleCode!: string;
}
