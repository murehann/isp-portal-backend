import { IsInt, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  packageId!: number;
}
