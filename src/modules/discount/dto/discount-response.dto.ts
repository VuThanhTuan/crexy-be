import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@/common/types/types';

export class DiscountResponseDto {
    @ApiProperty({ description: 'ID của mã giảm giá', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Tên mã giảm giá', example: 'Giảm 20% cho khách hàng mới' })
    name: string;

    @ApiPropertyOptional({ description: 'Giá trị giảm giá (text)', example: 'Giảm 20%' })
    value?: string;

    @ApiProperty({ description: 'Loại giảm giá', enum: ['percentage', 'fixed'], example: 'percentage' })
    discountType: DiscountType;

    @ApiProperty({ description: 'Giá trị giảm giá (số nguyên)', example: 20 })
    discountValue: number;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ 
        description: 'Số lượng sản phẩm đang sử dụng mã giảm giá này', 
        example: 5 
    })
    productCount?: number;
}

export class PaginatedDiscountResponseDto {
    @ApiProperty({ type: [DiscountResponseDto], description: 'Danh sách mã giảm giá' })
    data: DiscountResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại', example: 1 })
    page: number;

    @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang', example: 10 })
    totalPages: number;
}

