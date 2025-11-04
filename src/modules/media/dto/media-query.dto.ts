import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@/common/types/types';

export class MediaQueryDto {
    @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên gốc', example: 'banner' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo loại media', enum: ['image', 'video'] })
    @IsOptional()
    @IsEnum(['image', 'video'])
    mediaType?: MediaType;

    @ApiPropertyOptional({ 
        description: 'Sắp xếp theo trường', 
        example: 'createdAt',
        enum: ['createdAt', 'updatedAt', 'name', 'originName', 'size']
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ 
        description: 'Thứ tự sắp xếp', 
        example: 'DESC',
        enum: ['ASC', 'DESC']
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

