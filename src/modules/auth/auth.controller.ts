import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ResponseResult } from '@/common/types/interfaces';
import { LoginResponseDto } from './response';

class OAuthLoginDto {
    token: string;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly oauthService: OAuthService,
    ) {}

    @Post('google')
    @ApiResponse({
        status: 200,
        description: 'Google login successfully',
        type: LoginResponseDto,
    })
    async googleLogin(
        @Body() body: OAuthLoginDto,
    ): Promise<
        ResponseResult<LoginResponseDto & { user: { id: string; email: string; fullname: string; avatar: string } }>
    > {
        // Verify Google token
        const oauthProfile = await this.oauthService.verifyGoogleToken(body.token);

        // Find or create user
        const user = await this.authService.findOrCreateOAuthUser(oauthProfile);

        // Generate JWT tokens
        const tokens = await this.authService.generateTokens(user);

        return {
            message: 'Google login successfully',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    avatar: user.avatar || '',
                },
            },
        };
    }

    @Post('facebook')
    @ApiResponse({
        status: 200,
        description: 'Facebook login successfully',
        type: LoginResponseDto,
    })
    async facebookLogin(
        @Body() body: OAuthLoginDto,
    ): Promise<
        ResponseResult<LoginResponseDto & { user: { id: string; email: string; fullname: string; avatar: string } }>
    > {
        // TODO: Implement Facebook OAuth
        const oauthProfile = await this.oauthService.verifyFacebookToken(body.token);
        const user = await this.authService.findOrCreateOAuthUser(oauthProfile);
        const tokens = await this.authService.generateTokens(user);

        return {
            message: 'Facebook login successfully',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    avatar: user.avatar || '',
                },
            },
        };
    }

    @Post('tiktok')
    @ApiResponse({
        status: 200,
        description: 'TikTok login successfully',
        type: LoginResponseDto,
    })
    async tiktokLogin(
        @Body() body: OAuthLoginDto,
    ): Promise<
        ResponseResult<LoginResponseDto & { user: { id: string; email: string; fullname: string; avatar: string } }>
    > {
        // TODO: Implement TikTok OAuth
        const oauthProfile = await this.oauthService.verifyTikTokToken(body.token);
        const user = await this.authService.findOrCreateOAuthUser(oauthProfile);
        const tokens = await this.authService.generateTokens(user);

        return {
            message: 'TikTok login successfully',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    avatar: user.avatar || '',
                },
            },
        };
    }
}
