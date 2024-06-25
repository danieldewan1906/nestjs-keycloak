import { ExecutionContext, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';

type KeycloakResource = 'User - Category Resource' | 'Admin - Category Resource' | 'Admin - User Management';
type KeycloakScopes = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const AuthKey = 'auth';

export const Auth = (data: {
    resource?: KeycloakResource;
    scope?: KeycloakScopes;
}) => SetMetadata(AuthKey, data);

export const Token = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const token = request.get('authorization');

        if (token && token.startsWith("Bearer ")) {
            return token;
        } else {
            throw new UnauthorizedException();
        }
    }
)
