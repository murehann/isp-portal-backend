import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateInternetLogonDto } from './create-internet-logon.dto';

export class CreateCustomerDto extends CreateUserDto {
  internetLogonData!: CreateInternetLogonDto;
}
