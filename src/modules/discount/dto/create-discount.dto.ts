import { IsString, IsNotEmpty, IsEnum, IsNumber, IsInt, Min, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DiscountType } from '@/common/types/types';
import { DISCOUNT_TYPE } from '@/common/consts/app';

export class CreateDiscountDto {
    @ApiProperty({ description: 'Tên mã giảm giá', example: 'Giảm 20% cho khách hàng mới' })
    @IsString()
    @IsNotEmpty({ message: 'Tên mã giảm giá không được để trống' })
    @MaxLength(255, { message: 'Tên mã giảm giá không được vượt quá 255 ký tự' })
    name: string;

    @ApiPropertyOptional({ description: 'Giá trị giảm giá', example: 'Giảm 20%' })
    @IsString()
    @IsOptional()
    value?: string;

    @ApiProperty({ 
        description: 'Loại giảm giá', 
        enum: Object.values(DISCOUNT_TYPE),
        example: DISCOUNT_TYPE.PERCENTAGE 
    })
    @IsEnum(Object.values(DISCOUNT_TYPE), { 
        message: 'Loại giảm giá phải là "percentage" hoặc "fixed"' 
    })
    @IsNotEmpty({ message: 'Loại giảm giá không được để trống' })
    discountType: DiscountType;

    @ApiProperty({ 
        description: 'Giá trị giảm giá (số nguyên). Nếu percentage: 0-100, nếu fixed: số tiền', 
        example: 20 
    })
    @Type(() => Number)
    @IsNumber({}, { message: 'Giá trị giảm giá phải là số' })
    @IsInt({ message: 'Giá trị giảm giá phải là số nguyên' })
    @Min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' })
    discountValue: number;
}

