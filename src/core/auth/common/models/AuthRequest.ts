import { Request } from 'express';
import { UserPayload } from '@core/auth/common/auth.interfaces';

export interface EcoaRequest extends Request {
  userPayload: UserPayload;
}
