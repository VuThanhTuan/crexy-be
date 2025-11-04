import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductColorsService } from './product-colors.service';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { ProductColorQueryDto } from './dto/product-color-query.dto';
import { ProductColorResponseDto, PaginatedProductColorResponseDto } from './dto/product-color-response.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Admin Product Colors')
@ApiBearerAuth()
@Controller('admin/product-colors')
@UseGuards(AdminAuthGuard)
export class AdminProductColorsController {
    constructor(private readonly productColorsService: ProductColorsService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo màu sắc mới' })
    @ApiResponse({ 
        status: 201, 
        description: 'Tạo màu sắc thành công', 
        type: ProductColorResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Mã màu đã tồn tại' })
    async create(@Body() createProductColorDto: CreateProductColorDto): Promise<ProductColorResponseDto> {
        return await this.productColorsService.create(createProductColorDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách màu sắc' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách thành công', 
        type: PaginatedProductColorResponseDto 
    })
    async findAll(@Query() query: ProductColorQueryDto): Promise<PaginatedProductColorResponseDto> {
        return await this.productColorsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết màu sắc' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy chi tiết thành công', 
        type: ProductColorResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy màu sắc' })
    async findOne(@Param('id') id: string): Promise<ProductColorResponseDto> {
        return await this.productColorsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật màu sắc' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công', 
        type: ProductColorResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy màu sắc' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Mã màu đã tồn tại' })
    async update(
        @Param('id') id: string, 
        @Body() updateProductColorDto: UpdateProductColorDto
    ): Promise<ProductColorResponseDto> {
        return await this.productColorsService.update(id, updateProductColorDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa màu sắc' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy màu sắc' })
    @ApiResponse({ status: 400, description: 'Không thể xóa màu sắc (có thể đang được sử dụng)' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.productColorsService.delete(id);
    }
}

