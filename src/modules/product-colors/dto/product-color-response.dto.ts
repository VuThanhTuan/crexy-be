import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductColorResponseDto {
    @ApiProperty({ description: 'ID của màu sắc', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Tên màu sắc', example: 'Đỏ tươi' })
    name: string;

    @ApiProperty({ description: 'Mã màu HEX', example: '#FF0000' })
    colorCode: string;

    @ApiPropertyOptional({ description: 'Mô tả về màu sắc' })
    description?: string;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class PaginatedProductColorResponseDto {
    @ApiProperty({ type: [ProductColorResponseDto], description: 'Danh sách màu sắc' })
    data: ProductColorResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại', example: 1 })
    page: number;

    @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang', example: 10 })
    totalPages: number;
}

