import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { AdminCategoryController } from './admin-category.controller';
import { CategoryRepository } from './category.repository';
import { Category } from '@/database/entities/category.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category]),
    ],
    controllers: [AdminCategoryController],
    providers: [CategoryRepository, CategoryService],
    exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}

