import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString({
    message: 'invalid password',
  })
  @IsNotEmpty({
    message: 'invalid password',
  })
  password!: string;
}
