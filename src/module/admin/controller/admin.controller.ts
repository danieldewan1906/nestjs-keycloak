import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/module/auth/guard/auth.guard';
import { AdminService } from '../service/admin.service';
import { Auth, Token } from 'src/module/auth/decorator/auth.decorator';
import { ValidateUserDto } from '../dto/request/validate-user.request.dto';
import { WebResponse } from 'src/util/web.response';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly _adminService: AdminService) {}

    @Put("user/:id")
    @Auth({resource: 'Admin - User Management', scope: 'PUT'})
    async validateUser(@Token() token: string, @Param("id") id: string, @Body() request: ValidateUserDto) : Promise<WebResponse<boolean>> {
        const result = await this._adminService.validateUser(token, id, request);
        return result;
    }
}
