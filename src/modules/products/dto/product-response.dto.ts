import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantResponseDto {
    @ApiProperty({ description: 'ID variant' })
    id: string;

    @ApiProperty({ description: 'Tên variant' })
    name: string;

    @ApiPropertyOptional({ description: 'Mô tả variant' })
    description?: string;

    @ApiProperty({ description: 'Trạng thái active' })
    isActive: boolean;

    @ApiPropertyOptional({ description: 'ID size' })
    productSizeId?: string;

    @ApiPropertyOptional({ description: 'ID màu' })
    productColorId?: string;

    @ApiProperty({ description: 'Giá variant (VNĐ) - giá để tính tiền' })
    price: number;

    @ApiPropertyOptional({ description: 'Thông tin size' })
    productSize?: {
        id: string;
        name: string;
        description?: string;
    };

    @ApiPropertyOptional({ description: 'Thông tin màu' })
    productColor?: {
        id: string;
        name: string;
        colorCode: string;
        description?: string;
    };

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class ProductMediaResponseDto {
    @ApiProperty({ description: 'ID product media' })
    id: string;

    @ApiProperty({ description: 'ID media' })
    mediaId: string;

    @ApiProperty({ description: 'Loại media (preview, detail_list, detail)' })
    mediaCategory: string;

    @ApiPropertyOptional({ description: 'Thông tin media' })
    media?: {
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

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class ProductAttributeResponseDto {
    @ApiProperty({ description: 'ID thuộc tính' })
    id: string;

    @ApiProperty({ description: 'Tên thuộc tính (ví dụ: Chất liệu, Xuất xứ)' })
    name: string;

    @ApiProperty({ description: 'Giá trị thuộc tính (ví dụ: Vải cotton, Việt Nam)' })
    value: string;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}


export class ProductResponseDto {
    @ApiProperty({ description: 'ID sản phẩm' })
    id: string;

    @ApiProperty({ description: 'Tên sản phẩm' })
    name: string;

    @ApiProperty({ description: 'Mô tả sản phẩm' })
    description: string;

    @ApiProperty({ description: 'Trạng thái hoạt động' })
    isActive: boolean;

    @ApiProperty({ description: 'ID danh mục' })
    categoryId: string;

    @ApiProperty({ description: 'ID giảm giá' })
    discountId: string;

    @ApiProperty({ description: 'Giá sản phẩm (VNĐ) - chỉ để hiển thị' })
    price: number;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Thông tin danh mục' })
    category?: {
        id: string;
        name: string;
        slug: string;
    };

    @ApiPropertyOptional({ description: 'Thông tin giảm giá' })
    discount?: {
        id: string;
        name: string;
        discountValue: number;
        discountType: string;
    };

    @ApiPropertyOptional({ description: 'Danh sách variants', type: [ProductVariantResponseDto] })
    productVariants?: ProductVariantResponseDto[];


    @ApiPropertyOptional({ description: 'Danh sách media', type: [ProductMediaResponseDto] })
    productMedia?: ProductMediaResponseDto[];

    @ApiPropertyOptional({ description: 'Danh sách thuộc tính sản phẩm', type: [ProductAttributeResponseDto] })
    productAttributes?: ProductAttributeResponseDto[];

    

    @ApiPropertyOptional({ description: 'Hình đại diện (media category: preview)' })
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
    
    @ApiPropertyOptional({ description: 'Hình phụ (media category: secondary)' })
    secondaryImage?: {
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

export class ProductSummaryResponseDto {
    @ApiProperty({ description: 'ID sản phẩm' })
    id: string;

    @ApiProperty({ description: 'Tên sản phẩm' })
    name: string;

    @ApiProperty({ description: 'Giá sản phẩm (VNĐ) - chỉ để hiển thị' })
    price: number;

    @ApiPropertyOptional({ description: 'Thông tin danh mục' })
    category?: {
        id: string;
        name: string;
        slug: string;
    };

    @ApiPropertyOptional({ description: 'Hình đại diện (media category: primary)' })
    primaryImage?: {
        id: string;
        name: string;
        originName: string;
        url: string;
        mediaType: string;
        mimeType?: string;
        size?: number;
        width?: number;
        height?: number;
    };

    @ApiPropertyOptional({ description: 'Hình phụ (media category: secondary)' })
    secondaryImage?: {
        id: string;
        name: string;
        originName: string;
        url: string;
        mediaType: string;
        mimeType?: string;
        size?: number;
        width?: number;
        height?: number;
    };

    @ApiPropertyOptional({ description: 'Thông tin giảm giá' })
    discount?: {
        id: string;
        name: string;
        discountValue: number;
        discountType: string;
    };

    @ApiPropertyOptional({ description: 'Danh sách variants', type: [ProductVariantResponseDto] })
    productVariants?: ProductVariantResponseDto[];

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}

export class PaginatedProductResponseDto {
    @ApiProperty({ description: 'Danh sách sản phẩm', type: [ProductResponseDto] })
    data: ProductResponseDto[];

    @ApiProperty({ description: 'Tổng số sản phẩm' })
    total: number;

    @ApiProperty({ description: 'Số trang hiện tại' })
    page: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang' })
    totalPages: number;
}
