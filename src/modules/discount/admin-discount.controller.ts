import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountQueryDto } from './dto/discount-query.dto';
import { DiscountResponseDto, PaginatedDiscountResponseDto } from './dto/discount-response.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';

@ApiTags('Admin Discounts')
@ApiBearerAuth()
@Controller('admin/discounts')
@UseGuards(AdminAuthGuard)
export class AdminDiscountController {
    constructor(private readonly discountService: DiscountService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo mã giảm giá mới' })
    @ApiResponse({ 
        status: 201, 
        description: 'Tạo mã giảm giá thành công', 
        type: DiscountResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(@Body() createDiscountDto: CreateDiscountDto): Promise<DiscountResponseDto> {
        return await this.discountService.create(createDiscountDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách mã giảm giá' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách thành công', 
        type: PaginatedDiscountResponseDto 
    })
    async findAll(@Query() query: DiscountQueryDto): Promise<PaginatedDiscountResponseDto> {
        return await this.discountService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết mã giảm giá' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy chi tiết thành công', 
        type: DiscountResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy mã giảm giá' })
    async findOne(@Param('id') id: string): Promise<DiscountResponseDto> {
        return await this.discountService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật mã giảm giá' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công', 
        type: DiscountResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy mã giảm giá' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async update(
        @Param('id') id: string, 
        @Body() updateDiscountDto: UpdateDiscountDto
    ): Promise<DiscountResponseDto> {
        return await this.discountService.update(id, updateDiscountDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mã giảm giá' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy mã giảm giá' })
    @ApiResponse({ 
        status: 400, 
        description: 'Không thể xóa mã giảm giá (đang được sử dụng bởi sản phẩm)' 
    })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.discountService.delete(id);
    }
}

