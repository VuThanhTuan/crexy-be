import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaResponseDto {
    @ApiProperty({ description: 'ID media' })
    id: string;

    @ApiProperty({ description: 'Tên file' })
    name: string;

    @ApiProperty({ description: 'URL' })
    url: string;

    @ApiPropertyOptional({ description: 'MIME type' })
    mimeType?: string;
}

export class ProductInCollectionDto {
    @ApiProperty({ description: 'ID sản phẩm' })
    id: string;

    @ApiProperty({ description: 'Tên sản phẩm' })
    name: string;

    @ApiPropertyOptional({ description: 'Giá sản phẩm' })
    price?: number;

    @ApiPropertyOptional({ description: 'Hình đại diện sản phẩm' })
    primaryImage?: {
        id: string;
        name: string;
        originName: string;
        url: string;
        mediaType: string;
        mimeType: string;
        size?: number;
        width?: number;
        height?: number;
    };
}

export class CollectionResponseDto {
    @ApiProperty({ description: 'ID bộ sưu tập' })
    id: string;

    @ApiProperty({ description: 'Tên bộ sưu tập' })
    name: string;

    @ApiPropertyOptional({ description: 'Mô tả' })
    description?: string;

    @ApiPropertyOptional({ description: 'Slug URL' })
    slug?: string;

    @ApiPropertyOptional({ description: 'Hình đại diện' })
    media?: MediaResponseDto;

    @ApiPropertyOptional({ description: 'Danh sách sản phẩm', type: [ProductInCollectionDto] })
    products?: ProductInCollectionDto[];

    @ApiProperty({ description: 'Số lượng sản phẩm' })
    productCount: number;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class PaginatedCollectionResponseDto {
    @ApiProperty({ description: 'Danh sách bộ sưu tập', type: [CollectionResponseDto] })
    data: CollectionResponseDto[];

    @ApiProperty({ description: 'Tổng số bộ sưu tập' })
    total: number;

    @ApiProperty({ description: 'Số trang hiện tại' })
    page: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang' })
    totalPages: number;
}
