import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
    @ApiProperty({ description: 'Tên bộ sưu tập', example: 'Bộ sưu tập mùa hè 2024' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Mô tả bộ sưu tập', example: 'Bộ sưu tập các sản phẩm mùa hè' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Slug URL', example: 'bo-suu-tap-mua-he-2024' })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiPropertyOptional({ description: 'ID hình đại diện', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsOptional()
    mediaId?: string;

    @ApiPropertyOptional({ 
        description: 'Danh sách ID sản phẩm trong bộ sưu tập',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
    })
    @IsArray()
    @IsUUID(undefined, { each: true })
    @IsOptional()
    productIds?: string[];
}
