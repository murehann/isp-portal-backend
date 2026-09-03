import { QueryFailedError } from 'typeorm';

interface MySqlDriverError {
  code?: string;
  errno?: number;
  sqlState?: string;
}

export function isDuplicateKeyError(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as MySqlDriverError;
  return driverError.code === 'ER_DUP_ENTRY';
}
