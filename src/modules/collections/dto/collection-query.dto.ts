import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CollectionQueryDto {
    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên', example: 'mùa hè' })
    @IsString()
    @IsOptional()
    search?: string;

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
