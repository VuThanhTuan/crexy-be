import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ 
        description: 'Mật khẩu cũ', 
        example: 'oldpassword123' 
    })
    @IsString({ message: 'Mật khẩu cũ phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
    oldPassword: string;

    @ApiProperty({ 
        description: 'Mật khẩu mới', 
        example: 'newpassword123' 
    })
    @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    newPassword: string;

    @ApiProperty({ 
        description: 'Xác nhận mật khẩu mới', 
        example: 'newpassword123' 
    })
    @IsString({ message: 'Xác nhận mật khẩu mới phải là chuỗi' })
    @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
    confirmNewPassword: string;
}

