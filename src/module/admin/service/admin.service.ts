import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entity/user.entity';
import { WebResponse } from 'src/util/web.response';
import { ValidateUserDto } from '../dto/request/validate-user.request.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs';
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
    constructor(
        private readonly _httpService: HttpService,
        private readonly _configService: ConfigService,
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ){}

    async validateUser(token: string, id: string, request: ValidateUserDto) : Promise<WebResponse<boolean>> {

        const {
            password
        } = request;

        let user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException("User Not Found");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await this.userModel.updateOne({
            username: user.username
        }, {
            isActive: true,
            password: hashPassword,
            updatedAt: new Date(),
            role: "user"
        }).exec();


        const headers = {
            "Content-type": "application/json",
            "Authorization": token
        };

        const credential = {
            type: "password",
            value: password,
            temporary: false
        }

        const payload = {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: true,
            emailVerified: false,
            credentials: [
                {...credential}
            ],
            attributes: {
                attribute_key: "attribute_value"
            }
        };

        const keyCloakRealm = this._configService.get("KEYCLOAK_REALM");
        await this._httpService.post(
            `/admin/realms/${keyCloakRealm}/users`,
            payload,
            {
                headers
            }
        )
        .pipe(
            map((res) => res.data),
            catchError((err) => {
                console.log(err.response.data);
                throw err.response.data;
            })
        ).toPromise();

        const keycloakClientId = this._configService.get("KEYCLOAK_CLIENT_ID");
        const getListClient = await this._httpService.get(
            `/admin/realms/${keyCloakRealm}/clients?clientId=${keycloakClientId}&search=true`,
            {
                headers
            }
        ).toPromise();
        let getClientId = null;
        for (const data of getListClient.data) {
            if (data.clientId === keycloakClientId) {
                getClientId = data.id;
                break;
            }
        }

        const getListUser = await this._httpService.get(
            `/admin/realms/${keyCloakRealm}/users`,
            {
                headers
            }
        ).toPromise();
        let getUserId = null;
        for (const data of getListUser.data) {
            if (data.username === user.username) {
                getUserId = data.id;
                break;
            }
        }

        const requestRoleUser = {
            id: "dfc3fa36-d402-40f7-b1cc-8c5d10501c37",
            name: "user",
            description: "Client user role"
        };

        await this._httpService.post(
            `/admin/realms/${keyCloakRealm}/users/${getUserId}/role-mappings/clients/${getClientId}`,
            [requestRoleUser],
            {
                headers
            }
        ).toPromise()

        return {
            status: 200,
            message: "OK",
            data: true
        }
    }
}
