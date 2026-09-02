import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsInt, Min } from 'class-validator';

export class CreateCustomerDto extends CreateUserDto {
  @IsInt()
  @Min(1)
  packageId!: number;
}
