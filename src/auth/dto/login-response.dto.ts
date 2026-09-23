import { AuthTokenPayloadDto } from './auth-token-payload.dto';

export class LoginResponseDto extends AuthTokenPayloadDto {
  accessToken!: string;
}
