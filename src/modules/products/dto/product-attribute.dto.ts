import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributeDto {
    @ApiProperty({ 
        description: 'Tên thuộc tính (ví dụ: Chất liệu, Xuất xứ, Màu sắc)', 
        example: 'Chất liệu' 
    })
    @IsString()
    @IsNotEmpty({ message: 'Tên thuộc tính là bắt buộc' })
    name: string;

    @ApiProperty({ 
        description: 'Giá trị thuộc tính (ví dụ: Vải cotton, Việt Nam)', 
        example: 'Vải cotton' 
    })
    @IsString()
    @IsNotEmpty({ message: 'Giá trị thuộc tính là bắt buộc' })
    value: string;
}

