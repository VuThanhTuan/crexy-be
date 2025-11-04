import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Admin Products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo sản phẩm mới' })
    @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công', type: ProductResponseDto })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        return await this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm (Admin)' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: PaginatedProductResponseDto })
    async findAll(@Query() query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
        return await this.productsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết sản phẩm (Admin)' })
    @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
    async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
        return await this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật sản phẩm' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        return await this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sản phẩm' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.productsService.delete(id);
    }
}
