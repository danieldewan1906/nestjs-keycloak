import { HttpService } from "@nestjs/axios";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";
import { AuthKey } from "../decorator/auth.decorator";
import { catchError, firstValueFrom, map } from "rxjs";

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
    constructor(
        private readonly _reflector: Reflector,
        private readonly _httpService: HttpService,
        private readonly _configService: ConfigService
    ){};

    async canActivate(context: ExecutionContext) {
        const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authorization = request.headers["authorization"];
        if (!authorization || !authorization.startsWith("Bearer")) {
            return false;
        }
        const token = authorization.split(" ")[1];

        const getResource: {resource: string} = this._reflector.getAllAndOverride<{
            resource: string;
        }>(AuthKey, [context.getClass()]);
        
        const getScope: { scope: string } = this._reflector.getAllAndOverride<{
            scope: string;
        }>(AuthKey, [context.getHandler()]);

        const resourceAndScope: { resource: string; scope: string} = this._reflector.getAllAndOverride<{
            resource: string;
            scope: string;
        }>(AuthKey, [context.getHandler(), context.getClass()]);

        if (getResource && getScope) {
            resourceAndScope.resource = getResource.resource;
            resourceAndScope.scope = getScope.scope;
        }

        if (!resourceAndScope) {
            throw new ForbiddenException("You are not authorized to access this resource")
        }

        const permission = `${resourceAndScope.resource}#${resourceAndScope.scope}`;
        const requestBody = {
            grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
            audience: this._configService.get("KEYCLOAK_CLIENT_ID"),
            permission: permission,
            response_mode: 'decision'
        }

        const baseUrl = this._configService.get("KEYCLOAK_URL");
        const realm = this._configService.get("KEYCLOAK_REALM");

        return await firstValueFrom(
            this._httpService
                .post(
                    `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }
                )
                .pipe(
                    map((res) => {
                        return res.data;
                    }),
                    catchError((err) => {
                        throw new ForbiddenException(
                            "You are not authorized to access this resource"
                        )
                    })
                )
        )
    }

}