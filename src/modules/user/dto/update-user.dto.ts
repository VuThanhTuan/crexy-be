import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ 
        description: 'Tên hiển thị (fullname)', 
        example: 'Nguyễn Văn A' 
    })
    @IsString({ message: 'Tên hiển thị phải là chuỗi' })
    @IsOptional()
    @MaxLength(225, { message: 'Tên hiển thị không được vượt quá 225 ký tự' })
    fullname?: string;

    @ApiPropertyOptional({ 
        description: 'Số điện thoại', 
        example: '0912345678' 
    })
    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    @IsOptional()
    @Matches(/^[0-9]{10,11}$/, { 
        message: 'Số điện thoại phải có 10-11 chữ số' 
    })
    phone?: string;

    @ApiPropertyOptional({ 
        description: 'Địa chỉ', 
        example: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM' 
    })
    @IsString({ message: 'Địa chỉ phải là chuỗi' })
    @IsOptional()
    address?: string;
}

