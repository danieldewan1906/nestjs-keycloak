import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { WebResponse } from 'src/util/web.response';
import { CategoryRequestDto } from '../dto/request/category.request.dto';

@Injectable()
export class CategoryService {

    private baseUrl: string;
    constructor(private readonly _httpService: HttpService) {
        this.baseUrl = 'http://127.0.0.1:8081'
    }

    async getListCategory() : Promise<CategoryResponseDto[]> {
        const {data} = {data: WebResponse<CategoryResponseDto[]>} = 
            await this._httpService.get(`${this.baseUrl}/api/category`)
            .toPromise();
        return data;
    }

    async addCategory(
        request: CategoryRequestDto
    ) : Promise<CategoryResponseDto> {
        const {
            name
        } = request;

        const {data} = {data: WebResponse<CategoryResponseDto>} =
            await this._httpService.post(`${this.baseUrl}/api/category`, {
                name
            }).toPromise();
        return data;
    }
}
