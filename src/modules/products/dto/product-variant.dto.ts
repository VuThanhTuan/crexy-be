import { IsUUID, IsBoolean, IsOptional, IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantDto {
    @ApiPropertyOptional({ 
        description: 'ID của size sản phẩm', 
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID()
    @IsOptional()
    sizeId?: string;

    @ApiPropertyOptional({ 
        description: 'ID của màu sắc sản phẩm', 
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID()
    @IsOptional()
    colorId?: string;

    @ApiPropertyOptional({ 
        description: 'Trạng thái active của variant', 
        example: true,
        default: false 
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ 
        description: 'Tên của variant (tự động tạo nếu không cung cấp)', 
        example: 'Đỏ - Size M' 
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ 
        description: 'Mô tả variant', 
        example: 'Biến thể màu đỏ size M' 
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ 
        description: 'Giá variant (VNĐ) - giá để tính tiền', 
        example: 550000 
    })
    @IsNumber()
    @Min(0)
    @IsNotEmpty({ message: 'Giá variant là bắt buộc' })
    price: number;
}

