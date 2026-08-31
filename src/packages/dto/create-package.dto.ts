import { IsInt, Min } from 'class-validator';
import { IsIdentifierCode, IsName } from 'src/common/decorators';

export class CreatePackageDto {
  @IsName()
  name!: string;

  @IsIdentifierCode()
  code!: string;

  @IsInt()
  @Min(1)
  bandwidthMbps!: number;

  @IsInt()
  @Min(0)
  price!: number;
}
