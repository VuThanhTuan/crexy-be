import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { comparePassword } from '@/common/helpers/bycrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/common/types/types';
import { LoginRequestDto } from './request';
import { OAuthUserProfile } from './oauth.service';
import { User } from '@/database/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly userRepository: UserRepository,
    ) {}

    async login(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
        // Validate user credentials
        const user = await this.userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    /**
     * Find or create user from OAuth provider
     */
    async findOrCreateOAuthUser(oauthProfile: OAuthUserProfile): Promise<User> {
        // Try to find user by identityId and provider
        let user = await this.userRepository.findByIdentityIdAndProvider(
            oauthProfile.identityId,
            oauthProfile.provider,
        );

        if (user) {
            // Update user info if changed
            user.avatar = oauthProfile.avatar || user.avatar;
            user.emailVerified = oauthProfile.emailVerified;
            user.fullname = oauthProfile.name || user.fullname;
            const updatedUser = await this.userRepository.update(user.id, user);
            return updatedUser!;
        }

        // Check if user exists with same email but different provider
        const existingUser = await this.userRepository.findByEmail(oauthProfile.email);
        if (existingUser) {
            // Link OAuth account to existing user
            existingUser.identityId = oauthProfile.identityId;
            existingUser.provider = oauthProfile.provider;
            existingUser.avatar = oauthProfile.avatar || existingUser.avatar;
            existingUser.emailVerified = oauthProfile.emailVerified;
            const updatedUser = await this.userRepository.update(existingUser.id, existingUser);
            return updatedUser!;
        }

        // Create new user
        const newUser = await this.userRepository.create({
            identityId: oauthProfile.identityId,
            provider: oauthProfile.provider,
            email: oauthProfile.email,
            fullname: oauthProfile.name,
            avatar: oauthProfile.avatar,
            emailVerified: oauthProfile.emailVerified,
            password: undefined, // OAuth users don't have password
            isStaff: false,
            isSuperAdmin: false,
        });

        return newUser;
    }

    /**
     * Generate JWT tokens for user
     */
    async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                username: user.email,
            } as JwtPayload,
            {
                secret: process.env.JWT_SECRET_KEY,
                expiresIn: '24h',
            },
        );

        const refreshToken = this.jwtService.sign(
            {},
            {
                secret: process.env.JWT_REFRESH_SECRET_KEY,
                expiresIn: '30d',
            },
        );

        return { accessToken, refreshToken };
    }
}
