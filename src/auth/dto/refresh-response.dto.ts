import { AuthTokenPayloadDto } from './auth-token-payload.dto';

export class RefreshResponseDto extends AuthTokenPayloadDto {
  accessToken!: string;
}
