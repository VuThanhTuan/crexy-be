import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm (Public)' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: PaginatedProductResponseDto })
    async findAll(@Query() query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
        return await this.productsService.findAllPublished(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết sản phẩm (Public)' })
    @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
    async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
        return await this.productsService.findOnePublished(id);
    }
}
