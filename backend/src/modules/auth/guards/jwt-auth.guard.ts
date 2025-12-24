import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Extract token from cookie (priority) or Authorization header (fallback)
    const cookieToken = request.cookies?.access_token;
    const headerToken = request.headers.authorization?.replace('Bearer ', '');

    const token = cookieToken || headerToken;

    if (token && !request.headers.authorization) {
      // Attach to header for Passport strategy
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }
}
