import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';

export function IsUsername(options?: ValidationOptions) {
  return applyDecorators(
    IsString(),
    IsNotEmpty(),
    MinLength(3),
    MaxLength(30),
    Matches(/^[a-zA-Z0-9_]+$/, {
      message: options?.message ?? 'invalid username',
    }),
  );
}
