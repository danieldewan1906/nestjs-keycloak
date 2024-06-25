import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/module/auth/guard/auth.guard';
import { CategoryService } from '../service/category.service';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { WebResponse } from 'src/util/web.response';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { CategoryRequestDto } from '../dto/request/category.request.dto';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
    constructor(private readonly _categoryService: CategoryService) {}

    @Get()
    @Auth({resource: 'User - Category Resource', scope: 'GET'})
    async getList(): Promise<WebResponse<CategoryResponseDto[]>> {
        const result = await this._categoryService.getListCategory();
        return {
            status: 200,
            message: "OK",
            data: result
        }
    }

    @Post()
    @Auth({resource: 'User - Category Resource', scope: 'POST'})
    async addCategory(@Body() request: CategoryRequestDto) : Promise<WebResponse<CategoryResponseDto>> {
        const result = await this._categoryService.addCategory(request);
        return {
            status: 200,
            message: "OK",
            data: result
        }
    }
}
