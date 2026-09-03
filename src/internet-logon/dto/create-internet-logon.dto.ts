import { IsEmail, IsInt, Min } from 'class-validator';

export class CreateInternetLogonDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsEmail()
  userEmail!: string;

  @IsInt()
  @Min(1)
  currentSubscriptionId!: number;
}
