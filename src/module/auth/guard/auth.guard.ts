import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt-access") {
  constructor(private readonly _reflector: Reflector){
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const result = super.canActivate(context);
    return result;
  }

  handleRequest(err, user, info) {
    if (err) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
