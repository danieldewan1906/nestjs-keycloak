import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto } from '../dto/request/login-user.request.dto';
import { catchError, map } from 'rxjs';
import { RegisterUserRequestDto } from '../dto/request/register-user.request.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtModel } from '../model/jwt.model';
import { WebResponse } from 'src/util/web.response';
import { ResponseUserDto } from '../dto/response/register-user.response.dto';
import { Model } from 'mongoose';
import { User } from 'src/entity/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {

    constructor(
        private readonly _httpService: HttpService,
        private readonly _configService: ConfigService,
        private readonly _jwtService: JwtService,
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ){}

    async login(
        request: LoginRequestDto
    ) : Promise<WebResponse<JwtModel>> {
        const {
            username,
            password
        } = request;

        const headers = {
            "Content-type": "application/x-www-form-urlencoded"
        };

        const payload = {
            client_id: this._configService.get("KEYCLOAK_CLIENT_ID"),
            client_secret: this._configService.get("KEYCLOAK_CLIENT_SECRET"),
            scope: this._configService.get("KEYCLOAK_SCOPE"),
            grant_type: "password",
            username: username,
            password: password
        };

        const keyCloakRealm = this._configService.get("KEYCLOAK_REALM");
        const response = await this._httpService.post(
            `/realms/${keyCloakRealm}/protocol/openid-connect/token`,
            payload,
            {
                headers,
            }
        )
        .pipe(
            map((res) => res.data),
            catchError((err) => {
                console.log(err);
                throw err;
            })
        ).toPromise();

        if (!response) {
            throw new BadRequestException("Invalid Credentials")
        }

        const data = <JwtModel>this._jwtService.decode(response.access_token);
        data.token = response.access_token;

        return {
            status: 200,
            message: "OK",
            data: data
        };
    }

    async register(
        request: RegisterUserRequestDto
    ) : Promise<WebResponse<ResponseUserDto>>{
        const {
            username,
            email,
            firstName,
            lastName
        } = request;

        let user = await this.getUserByUsername(username);
        if (user) {
            throw new BadRequestException("User already registered")
        }

        user = new this.userModel({
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName,
            isActive: false,
            createdAt: new Date()
        });

        console.log("USER =>", user);

        try {
            await user.save();
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        if (!user) {
            throw new BadRequestException('User not created');
        }

        return {
            status: 200,
            message: "OK",
            data: {
                username: username,
                email: email,
                firstName: firstName,
                lastName: lastName,
                // role: requestRoleUser.name
            }
        };
    }

    private async getUserByUsername(username: string) {
        let user = await this.userModel.findOne({username}, "username email").exec();
        if (user) {
            return user;
        } else {
            return null;
        }
    }
}
