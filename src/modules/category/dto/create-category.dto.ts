import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Tên danh mục', example: 'Áo thun nam' })
    @IsString()
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @MaxLength(255, { message: 'Tên danh mục không được vượt quá 255 ký tự' })
    name: string;

    @ApiPropertyOptional({ 
        description: 'Slug của danh mục', 
        example: 'ao-thun-nam' 
    })
    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Slug không được vượt quá 255 ký tự' })
    slug?: string;

    @ApiPropertyOptional({ 
        description: 'Mô tả về danh mục', 
        example: 'Các loại áo thun dành cho nam giới' 
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ 
        description: 'URL ảnh nền của danh mục', 
        example: 'https://example.com/images/category-bg.jpg' 
    })
    @IsString()
    @IsOptional()
    backgroundImage?: string;

    @ApiPropertyOptional({ 
        description: 'ID của danh mục cha', 
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID('4', { message: 'ID danh mục cha phải là UUID hợp lệ' })
    @IsOptional()
    parentId?: string;
}

