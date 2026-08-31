import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsUsername } from 'src/users/decorators';

export class CreateInternetLogonDto {
  @IsUsername({
    message: 'Username can only contain English letters, numbers, and _',
  })
  internetLogonUsername!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^[a-zA-Z0-9@_-]+$/, {
    message: 'Password can only contain English letters, numbers, @, _, and -',
  })
  @Matches(/[a-zA-Z]/, {
    message: 'Password must contain at least one English letter',
  })
  @Matches(/\d/, {
    message: 'Password must contain at least one number',
  })
  internetLogonPassword!: string;
}
