import { User } from '@prisma/client';
import { Request } from 'express';

export type TokenPayload = {
  user_id: string;
};

export interface AuthenticatedRequest extends Request {
  user: User;
}
