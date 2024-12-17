import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../type';

@Injectable()
export class UrlRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user = request.user;

    if (
      request.headers.origin === 'http://localhost:5173' &&
      user.role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('Access denied');
    }

    return true;
  }
}
