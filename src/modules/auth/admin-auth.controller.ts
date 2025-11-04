import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from '@/common/decorators/auth';
import { LoginRequestDto } from './request';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseResult } from '@/common/types/interfaces';
import { LoginResponseDto } from './response';

@Controller('admin/auth')
@ApiTags('Admin Auth')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiResponse({
        status: 200,
        description: 'Admin login successfully',
        type: LoginResponseDto,
    })
    async login(@Body() loginDto: LoginRequestDto) : Promise<ResponseResult<LoginResponseDto>> {
        const result = await this.authService.login(loginDto);
        return {
            message: 'Admin login successfully',
            data: result,
        };
    }

    @Auth()
    @Get('profile')
    async getProfile() {
        return { message: 'Admin profile accessed successfully' };
    }

}
