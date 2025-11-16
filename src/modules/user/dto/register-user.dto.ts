import { IsString, IsNotEmpty, IsEmail, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ 
        description: 'Email (dùng để đăng nhập)', 
        example: 'user@example.com' 
    })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({ 
        description: 'Tên hiển thị (fullname)', 
        example: 'Nguyễn Văn A' 
    })
    @IsString({ message: 'Tên hiển thị phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
    @MaxLength(225, { message: 'Tên hiển thị không được vượt quá 225 ký tự' })
    fullname: string;

    @ApiProperty({ 
        description: 'Số điện thoại', 
        example: '0912345678' 
    })
    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @Matches(/^[0-9]{10,11}$/, { 
        message: 'Số điện thoại phải có 10-11 chữ số' 
    })
    phone: string;

    @ApiProperty({ 
        description: 'Mật khẩu', 
        example: 'password123' 
    })
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({ 
        description: 'Xác nhận mật khẩu', 
        example: 'password123' 
    })
    @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
    confirmPassword: string;

    @ApiProperty({ 
        description: 'Địa chỉ', 
        example: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM' 
    })
    @IsString({ message: 'Địa chỉ phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;
}

