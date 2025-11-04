import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ProductQueryDto {
    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên', example: 'áo thun' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo danh mục', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'Lọc theo trạng thái', example: true })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Số trang', example: 1, minimum: 1 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10, minimum: 1, maximum: 100 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value))
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'createdAt' })
    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsString()
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
