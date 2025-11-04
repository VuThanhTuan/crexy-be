import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductColorDto {
    @ApiProperty({ description: 'Tên màu sắc', example: 'Đỏ tươi' })
    @IsString()
    @IsNotEmpty({ message: 'Tên màu không được để trống' })
    @MaxLength(255, { message: 'Tên màu không được vượt quá 255 ký tự' })
    name: string;

    @ApiProperty({ 
        description: 'Mã màu HEX (bao gồm dấu #)', 
        example: '#FF0000',
        pattern: '^#[0-9A-Fa-f]{6}$'
    })
    @IsString()
    @IsNotEmpty({ message: 'Mã màu không được để trống' })
    @Matches(/^#[0-9A-Fa-f]{6}$/, { 
        message: 'Mã màu phải là mã HEX hợp lệ (ví dụ: #FF0000)' 
    })
    colorCode: string;

    @ApiPropertyOptional({ 
        description: 'Mô tả về màu sắc', 
        example: 'Màu đỏ tươi, phù hợp với phong cách năng động' 
    })
    @IsString()
    @IsOptional()
    description?: string;
}

