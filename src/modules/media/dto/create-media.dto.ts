import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@/common/types/types';

export class CreateMediaDto {
    @ApiProperty({ description: 'Tên file', example: 'product-banner-001' })
    @IsString()
    @IsNotEmpty({ message: 'Tên file không được để trống' })
    name: string;

    @ApiProperty({ description: 'Tên file gốc', example: 'banner.jpg' })
    @IsString()
    @IsNotEmpty({ message: 'Tên file gốc không được để trống' })
    originName: string;

    @ApiProperty({ description: 'Loại media', enum: ['image', 'video'] })
    @IsEnum(['image', 'video'], { message: 'Loại media không hợp lệ' })
    @IsNotEmpty({ message: 'Loại media không được để trống' })
    mediaType: MediaType;

    @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
    @IsString()
    @IsNotEmpty({ message: 'MIME type không được để trống' })
    mimeType: string;

    @ApiProperty({ description: 'URL file', example: 'https://s3.amazonaws.com/bucket/file.jpg' })
    @IsString()
    @IsNotEmpty({ message: 'URL không được để trống' })
    url: string;

    @ApiPropertyOptional({ description: 'Kích thước file (bytes)', example: 1024000 })
    @IsNumber()
    @IsOptional()
    size?: number;

    @ApiPropertyOptional({ description: 'Chiều rộng (px)', example: 1920 })
    @IsNumber()
    @IsOptional()
    width?: number;

    @ApiPropertyOptional({ description: 'Chiều cao (px)', example: 1080 })
    @IsNumber()
    @IsOptional()
    height?: number;
}

