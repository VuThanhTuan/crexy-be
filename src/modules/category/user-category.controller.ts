import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class UserCategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả danh mục (không phân trang) - sắp xếp từ mới đến cũ và theo tên' })
    @ApiResponse({ status: 200, description: 'Danh sách danh mục', type: [CategoryResponseDto] })
    async findAll(): Promise<CategoryResponseDto[]> {
        return await this.categoryService.findAllForUser();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
    @ApiResponse({ status: 200, description: 'Chi tiết danh mục', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
        return await this.categoryService.findOne(id);
    }
}
