import { type Request } from 'express';

export interface RequestWithRefreshCookie extends Request {
  cookies: {
    refreshToken?: string;
  };
}
