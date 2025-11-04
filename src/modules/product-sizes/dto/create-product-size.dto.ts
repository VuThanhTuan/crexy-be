import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductSizeDto {
    @ApiProperty({ description: 'Tên kích thước', example: 'XL' })
    @IsString()
    @IsNotEmpty({ message: 'Tên kích thước không được để trống' })
    @MaxLength(255, { message: 'Tên kích thước không được vượt quá 255 ký tự' })
    name: string;

    @ApiPropertyOptional({ 
        description: 'Mô tả về kích thước', 
        example: 'Kích thước XL phù hợp với người cao từ 1m75 trở lên' 
    })
    @IsString()
    @IsOptional()
    description?: string;
}



