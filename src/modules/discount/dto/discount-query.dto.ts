import { IsOptional, IsString, IsInt, Min, IsIn, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DISCOUNT_TYPE } from '@/common/consts/app';
import { DiscountType } from '@/common/types/types';

export class DiscountQueryDto {
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

    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên mã giảm giá', example: 'Giảm 20%' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ 
        description: 'Lọc theo loại giảm giá', 
        enum: Object.values(DISCOUNT_TYPE),
        example: DISCOUNT_TYPE.PERCENTAGE 
    })
    @IsOptional()
    @IsEnum(Object.values(DISCOUNT_TYPE), { 
        message: 'Loại giảm giá phải là "percentage" hoặc "fixed"' 
    })
    discountType?: DiscountType;

    @ApiPropertyOptional({ 
        description: 'Sắp xếp theo trường', 
        example: 'name',
        enum: ['name', 'discountType', 'discountValue', 'createdAt', 'updatedAt']
    })
    @IsOptional()
    @IsString()
    @IsIn(['name', 'discountType', 'discountValue', 'createdAt', 'updatedAt'], { 
        message: 'Chỉ cho phép sắp xếp theo name, discountType, discountValue, createdAt hoặc updatedAt' 
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

