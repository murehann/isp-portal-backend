import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsName } from 'src/common/decorators';

export class CreatePackageDto {
  @IsName()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Z])[A-Z_0-9]+$/, {
    message:
      'Code must contain at least one capital letter and can only contain capital letters, numbers, and _',
  })
  code!: string;

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
