import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResponseResult } from '@/common/types/interfaces';
import { User } from '@/database/entities/user.entity';
import { UserAuth } from '@/common/decorators/user-auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    @ApiResponse({ 
        status: 201, 
        description: 'Đăng ký thành công',
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Email đã được sử dụng',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ',
    })
    async register(@Body() registerDto: RegisterUserDto): Promise<ResponseResult<Omit<User, 'password'>>> {
        const user = await this.userService.register(registerDto);
        return {
            message: 'Đăng ký thành công',
            data: user,
        };
    }

    // Keep existing endpoints for backward compatibility
    @Get()
    async findAll() {
        return await this.userService.findAll();
    }

    // Specific routes must come before generic :id route
    @Get('profile/:id')
    @ApiOperation({ summary: 'Lấy thông tin user profile' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy thông tin thành công',
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy user',
    })
    async getProfile(@Param('id') id: string): Promise<ResponseResult<Omit<User, 'password'>>> {
        const user = await this.userService.getProfile(id);
        return {
            message: 'Lấy thông tin thành công',
            data: user!,
        };
    }

    @Get('me')
    @UserAuth()
    @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy thông tin thành công',
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy user',
    })
    async getCurrentUser(@CurrentUser() currentUser: any): Promise<ResponseResult<Omit<User, 'password'>>> {
        const user = await this.userService.getProfile(currentUser.userId);
        return {
            message: 'Lấy thông tin thành công',
            data: user!,
        };
    }

    @Put('profile/:id')
    @ApiOperation({ summary: 'Cập nhật thông tin user (không được update email)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công',
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy user',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ',
    })
    async updateProfile(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto,
    ): Promise<ResponseResult<Omit<User, 'password'>>> {
        const user = await this.userService.updateProfile(id, updateDto);
        return {
            message: 'Cập nhật thành công',
            data: user!,
        };
    }

    @Put('change-password/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đổi mật khẩu' })
    @ApiResponse({ 
        status: 200, 
        description: 'Đổi mật khẩu thành công',
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy user',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Mật khẩu cũ không đúng',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ',
    })
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<ResponseResult<null>> {
        await this.userService.changePassword(id, changePasswordDto);
        return {
            message: 'Đổi mật khẩu thành công',
            data: null,
        };
    }

    @Get(':id') 
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @Post()
    async create(@Body() createUserDto: any) {
        return await this.userService.create(createUserDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: any) {
        return await this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.userService.remove(id);
    }
}
