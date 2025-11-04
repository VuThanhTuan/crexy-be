import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { comparePassword } from '@/common/helpers/bycrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/common/types/types';
import { LoginRequestDto } from './request';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly userRepository: UserRepository,
    ) {}

    async login(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
        // Validate user credentials
        const user = await this.userRepository.findByUserName(loginDto.userName);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                username: user.userName,
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

        // save refresh token to database
        // await this.userRepository.update(user.id, { refreshToken });

        return { accessToken, refreshToken };
    }
}
