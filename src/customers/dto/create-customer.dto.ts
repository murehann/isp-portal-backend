import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateInternetLogonDto } from './create-internet-logon.dto';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto extends CreateUserDto {
  @ValidateNested()
  @Type(() => CreateInternetLogonDto)
  internetLogonData!: CreateInternetLogonDto;

  @IsInt()
  @Min(1)
  packageId!: number;
}
