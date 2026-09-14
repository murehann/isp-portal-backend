import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateInternetLogonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/[_@$.-]/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/^[A-Za-z0-9_@$.-]+$/, {
    message: 'Password contains invalid characters',
  })
  internetLogonPassword!: string;
}
