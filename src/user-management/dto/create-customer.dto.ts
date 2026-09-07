import { IsInt, Min } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
export class CreateCustomerDto extends CreateUserDto {
  @IsInt()
  @Min(1)
  packageId!: number;
}
