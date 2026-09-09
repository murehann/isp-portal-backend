import { IsInt, Min } from 'class-validator';
import { IsName } from 'src/common/decorators';

export class CreatePackageDto {
  @IsName()
  name!: string;

  @IsInt()
  @Min(1)
  downloadBandwidthMbps!: number;

  @IsInt()
  @Min(1)
  uploadBandwidthMbps!: number;

  @IsInt()
  @Min(0)
  price!: number;
}
