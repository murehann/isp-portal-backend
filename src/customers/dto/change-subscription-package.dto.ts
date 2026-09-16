import { IsInt, Min } from 'class-validator';

export class ChangeSubscriptionPackageDto {
  @IsInt()
  @Min(1)
  packageId!: number;
}
