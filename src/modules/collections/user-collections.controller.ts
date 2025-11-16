import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CollectionResponseDto, PaginatedCollectionResponseDto } from './dto/collection-response.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';

@ApiTags('Collections')
@Controller('collections')
export class UserCollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    @Get('menu')
    @ApiOperation({ summary: 'Lấy tối đa 5 bộ sưu tập để hiển thị menu (không phân trang)' })
    @ApiResponse({ status: 200, description: 'Danh sách bộ sưu tập', type: [CollectionResponseDto] })
    async menu(): Promise<CollectionResponseDto[]> {
        return await this.collectionsService.findTopForMenu(5);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách bộ sưu tập (có phân trang)' })
    @ApiResponse({ status: 200, description: 'Danh sách phân trang', type: PaginatedCollectionResponseDto })
    async findAll(@Query() query: CollectionQueryDto): Promise<PaginatedCollectionResponseDto> {
        return await this.collectionsService.findAllForUser(query);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Lấy chi tiết bộ sưu tập theo slug (kèm danh sách sản phẩm không phân trang)' })
    @ApiResponse({ status: 200, description: 'Chi tiết bộ sưu tập', type: CollectionResponseDto })
    async findOne(@Param('slug') slug: string): Promise<CollectionResponseDto> {
        return await this.collectionsService.findOneBySlug(slug);
    }
}
