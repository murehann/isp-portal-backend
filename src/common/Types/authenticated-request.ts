import { AuthTokenPayloadDto } from 'src/auth/dto/auth-token-payload.dto';
import { RequestWithRefreshCookie } from './request-with-refresh-cookie';

export interface AuthenticatedRequest extends RequestWithRefreshCookie {
  user: AuthTokenPayloadDto;
}
