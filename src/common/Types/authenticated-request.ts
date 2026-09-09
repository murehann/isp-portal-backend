import { AuthTokenPayloadDto } from 'src/auth/dto/auth-token-payload.dto';
import { type Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayloadDto;
}
