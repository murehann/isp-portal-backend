import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  @IsNotEmpty()
  packageCode!: string;
}
