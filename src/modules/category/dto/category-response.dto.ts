import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
    @ApiProperty({ description: 'ID của danh mục', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Tên danh mục', example: 'Áo thun nam' })
    name: string;

    @ApiPropertyOptional({ description: 'Slug của danh mục', example: 'ao-thun-nam' })
    slug?: string;

    @ApiPropertyOptional({ description: 'Mô tả về danh mục' })
    description?: string;

    @ApiPropertyOptional({ description: 'URL ảnh nền của danh mục' })
    backgroundImage?: string;

    @ApiPropertyOptional({ description: 'ID của danh mục cha' })
    parentId?: string;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ 
        description: 'Số lượng sản phẩm trong danh mục', 
        example: 42 
    })
    productCount?: number;

    @ApiPropertyOptional({ 
        description: 'Danh mục cha',
        type: () => CategoryResponseDto
    })
    parent?: CategoryResponseDto;

    @ApiPropertyOptional({ 
        description: 'Danh mục con',
        type: () => [CategoryResponseDto]
    })
    children?: CategoryResponseDto[];
}

export class PaginatedCategoryResponseDto {
    @ApiProperty({ type: [CategoryResponseDto], description: 'Danh sách danh mục' })
    data: CategoryResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại', example: 1 })
    page: number;

    @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang', example: 10 })
    totalPages: number;
}

