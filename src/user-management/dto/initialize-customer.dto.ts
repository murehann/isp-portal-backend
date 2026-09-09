import { PickType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';

export class InitializeCustomerDto extends PickType(CreateCustomerDto, [
  'packageId',
]) {}
