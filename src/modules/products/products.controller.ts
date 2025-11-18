import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto, PaginatedProductResponseDto, ProductSummaryResponseDto } from './dto/product-response.dto';

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

    @Get('top')
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm mới nhất (có thể lọc theo danh mục) để hiển thị hoặc gợi ý liên quan' })
    @ApiResponse({ status: 200, description: 'Danh sách sản phẩm mới nhất', type: [ProductSummaryResponseDto] })
    async top(
        @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number,
        @Query('categoryId') categoryId?: string,
    ): Promise<ProductSummaryResponseDto[]> {
        return await this.productsService.findTopLatest(limit, categoryId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết sản phẩm (Public)' })
    @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
    async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
        return await this.productsService.findOnePublished(id);
    }
}
