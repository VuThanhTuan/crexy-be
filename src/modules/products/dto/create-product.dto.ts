import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductMediaDto } from './product-media.dto';
import { ProductVariantDto } from './product-variant.dto';

export class CreateProductDto {
    @ApiProperty({ description: 'Tên sản phẩm', example: 'Áo thun nam' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ 
        description: 'Mô tả sản phẩm (hỗ trợ rich-text editor)', 
        example: '<p>Áo thun nam chất liệu cotton 100%</p>' 
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'ID danh mục', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @ApiPropertyOptional({ description: 'ID giảm giá', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsOptional()
    discountId?: string;

    @ApiProperty({ 
        description: 'Danh sách media của sản phẩm (ít nhất 1 ảnh preview, tối đa 10 ảnh detail_list)',
        type: [ProductMediaDto],
        example: [
            { mediaId: '123e4567-e89b-12d3-a456-426614174000', mediaCategory: 'primary' },
            { mediaId: '123e4567-e89b-12d3-a456-426614174001', mediaCategory: 'secondary' }
        ]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 ảnh' })
    @ValidateNested({ each: true })
    @Type(() => ProductMediaDto)
    mediaItems: ProductMediaDto[];

    @ApiProperty({ 
        description: 'Danh sách variants (kết hợp size và màu sắc, ít nhất 1 variant active)',
        type: [ProductVariantDto],
        example: [
            { sizeId: '123e4567-e89b-12d3-a456-426614174000', colorId: '123e4567-e89b-12d3-a456-426614174001', isActive: true },
            { sizeId: '123e4567-e89b-12d3-a456-426614174000', colorId: '123e4567-e89b-12d3-a456-426614174002', isActive: false }
        ]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 variant' })
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];
}
