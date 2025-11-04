import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductSizesService } from './product-sizes.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { ProductSizeQueryDto } from './dto/product-size-query.dto';
import { ProductSizeResponseDto, PaginatedProductSizeResponseDto } from './dto/product-size-response.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Admin Product Sizes')
@ApiBearerAuth()
@Controller('admin/product-sizes')
@UseGuards(AdminAuthGuard)
export class AdminProductSizesController {
    constructor(private readonly productSizesService: ProductSizesService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo kích thước mới' })
    @ApiResponse({ 
        status: 201, 
        description: 'Tạo kích thước thành công', 
        type: ProductSizeResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Tên kích thước đã tồn tại' })
    async create(@Body() createProductSizeDto: CreateProductSizeDto): Promise<ProductSizeResponseDto> {
        return await this.productSizesService.create(createProductSizeDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách kích thước' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách thành công', 
        type: PaginatedProductSizeResponseDto 
    })
    async findAll(@Query() query: ProductSizeQueryDto): Promise<PaginatedProductSizeResponseDto> {
        return await this.productSizesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết kích thước' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy chi tiết thành công', 
        type: ProductSizeResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
    async findOne(@Param('id') id: string): Promise<ProductSizeResponseDto> {
        return await this.productSizesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật kích thước' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công', 
        type: ProductSizeResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Tên kích thước đã tồn tại' })
    async update(
        @Param('id') id: string, 
        @Body() updateProductSizeDto: UpdateProductSizeDto
    ): Promise<ProductSizeResponseDto> {
        return await this.productSizesService.update(id, updateProductSizeDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa kích thước' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
    @ApiResponse({ status: 400, description: 'Không thể xóa kích thước (có thể đang được sử dụng)' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.productSizesService.delete(id);
    }
}



