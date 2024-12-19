import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../type';

@Injectable()
export class UrlRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user = request.user;

    const url =
      this.configService.get('FRONTEND_ADMIN_URL') || 'http://localhost:5173';

    if (request.headers.origin === url && user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }

    return true;
  }
}
