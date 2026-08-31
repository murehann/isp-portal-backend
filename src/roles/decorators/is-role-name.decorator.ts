import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';

export function IsRoleName(options?: ValidationOptions) {
  return applyDecorators(
    IsString(options),
    IsNotEmpty(options),
    MinLength(3, options),
    MaxLength(30, options),
    Matches(/^(?=.*[a-zA-Z])[a-zA-Z_ ]+$/, {
      ...options,
      message: options?.message ?? 'invalid role name',
    }),
  );
}
