import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';

export function IsRoleCode(options?: ValidationOptions) {
  return applyDecorators(
    IsString(options),
    IsNotEmpty(options),
    MinLength(3, options),
    MaxLength(30, options),
    Matches(/^(?=.*[A-Z])[A-Z_]+$/, {
      ...options,
      message: options?.message ?? 'invalid role code',
    }),
  );
}
