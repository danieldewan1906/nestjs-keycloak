import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from '../dto/request/login-user.request.dto';
import { JwtAuthGuard } from '../guard/auth.guard';
import { RegisterUserRequestDto } from '../dto/request/register-user.request.dto';
import { Auth, Token } from '../decorator/auth.decorator';
import { WebResponse } from 'src/util/web.response';
import { JwtModel } from '../model/jwt.model';

@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService){}

    @Post("/login")
    async login(@Body() request: LoginRequestDto) : Promise<WebResponse<JwtModel>> {
        return this._authService.login(request);
    }

    // @UseGuards(JwtAuthGuard)
    // @Auth({resource: 'Admin - User Management', scope: 'POST'})
    @Post("/register")
    async register(@Body() request: RegisterUserRequestDto) {
        return this._authService.register(request);
    }
}
