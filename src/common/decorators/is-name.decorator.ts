import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';

export function IsName(options?: ValidationOptions) {
  return applyDecorators(
    IsString(options),
    IsNotEmpty(options),
    MinLength(3, options),
    MaxLength(30, options),
    Matches(/^(?=.*[a-zA-Z])[a-zA-Z ]+$/, {
      ...options,
      message:
        options?.message ??
        'Only uppercase and lowercase English letters and spaces are allowed in name.',
    }),
  );
}
