import { IsOptional, IsString, IsInt, Min, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryQueryDto {
    @ApiPropertyOptional({ description: 'Số trang', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Số trang phải là số nguyên' })
    @Min(1, { message: 'Số trang phải lớn hơn 0' })
    page?: number;

    @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', example: 10, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Số bản ghi phải là số nguyên' })
    @Min(1, { message: 'Số bản ghi phải lớn hơn 0' })
    limit?: number;

    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên danh mục', example: 'Áo thun' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ 
        description: 'Lọc theo danh mục cha', 
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID danh mục cha phải là UUID hợp lệ' })
    parentId?: string;

    @ApiPropertyOptional({ 
        description: 'Sắp xếp theo trường', 
        example: 'name',
        enum: ['name', 'createdAt', 'updatedAt']
    })
    @IsOptional()
    @IsString()
    @IsIn(['name', 'createdAt', 'updatedAt'], { 
        message: 'Chỉ cho phép sắp xếp theo name, createdAt hoặc updatedAt' 
    })
    sortBy?: string;

    @ApiPropertyOptional({ 
        description: 'Thứ tự sắp xếp', 
        example: 'ASC',
        enum: ['ASC', 'DESC']
    })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'], { message: 'Thứ tự sắp xếp phải là ASC hoặc DESC' })
    sortOrder?: 'ASC' | 'DESC';
}

