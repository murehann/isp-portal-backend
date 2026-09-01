import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({
    message: 'invalid username',
  })
  @IsNotEmpty({
    message: 'invalid username',
  })
  username!: string;

  @IsString({
    message: 'invalid password',
  })
  @IsNotEmpty({
    message: 'invalid password',
  })
  password!: string;
}
