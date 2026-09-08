import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['displayName', 'password', 'address']),
) {}
