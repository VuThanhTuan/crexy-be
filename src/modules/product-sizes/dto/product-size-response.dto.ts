import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductSizeResponseDto {
    @ApiProperty({ description: 'ID của kích thước', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Tên kích thước', example: 'XL' })
    name: string;

    @ApiPropertyOptional({ description: 'Mô tả về kích thước' })
    description?: string;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class PaginatedProductSizeResponseDto {
    @ApiProperty({ type: [ProductSizeResponseDto], description: 'Danh sách kích thước' })
    data: ProductSizeResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại', example: 1 })
    page: number;

    @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang', example: 10 })
    totalPages: number;
}



