import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto, PaginatedCollectionResponseDto } from './dto/collection-response.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Admin Collections')
@ApiBearerAuth()
@Controller('admin/collections')
@UseGuards(AdminAuthGuard)
export class AdminCollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo bộ sưu tập mới' })
    @ApiResponse({ status: 201, description: 'Tạo bộ sưu tập thành công', type: CollectionResponseDto })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(@Body() createCollectionDto: CreateCollectionDto): Promise<CollectionResponseDto> {
        return await this.collectionsService.create(createCollectionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách bộ sưu tập (Admin)' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: PaginatedCollectionResponseDto })
    async findAll(@Query() query: CollectionQueryDto): Promise<PaginatedCollectionResponseDto> {
        return await this.collectionsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết bộ sưu tập (Admin)' })
    @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: CollectionResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bộ sưu tập' })
    async findOne(@Param('id') id: string): Promise<CollectionResponseDto> {
        return await this.collectionsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật bộ sưu tập' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: CollectionResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bộ sưu tập' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto): Promise<CollectionResponseDto> {
        return await this.collectionsService.update(id, updateCollectionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bộ sưu tập (chỉ được xóa khi danh sách sản phẩm rỗng)' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bộ sưu tập' })
    @ApiResponse({ status: 400, description: 'Bộ sưu tập có sản phẩm, không thể xóa' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.collectionsService.delete(id);
    }
}
