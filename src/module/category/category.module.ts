import { Module } from '@nestjs/common';
import { CategoryService } from './service/category.service';
import { CategoryController } from './controller/category.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController],
  imports: [HttpModule]
})
export class CategoryModule {}
