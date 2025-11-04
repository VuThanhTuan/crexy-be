import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto, PaginatedCategoryResponseDto } from './dto/category-response.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(AdminAuthGuard)
export class AdminCategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo danh mục mới' })
    @ApiResponse({ 
        status: 201, 
        description: 'Tạo danh mục thành công', 
        type: CategoryResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục cha' })
    @ApiResponse({ status: 409, description: 'Slug đã tồn tại' })
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        return await this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách danh mục' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách thành công', 
        type: PaginatedCategoryResponseDto 
    })
    async findAll(@Query() query: CategoryQueryDto): Promise<PaginatedCategoryResponseDto> {
        return await this.categoryService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy chi tiết thành công', 
        type: CategoryResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
        return await this.categoryService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật danh mục' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công', 
        type: CategoryResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Slug đã tồn tại' })
    async update(
        @Param('id') id: string, 
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<CategoryResponseDto> {
        return await this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa danh mục' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    @ApiResponse({ 
        status: 400, 
        description: 'Không thể xóa danh mục (đang được sử dụng bởi sản phẩm hoặc có danh mục con)' 
    })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.categoryService.delete(id);
    }
}

