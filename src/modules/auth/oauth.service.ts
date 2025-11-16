import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface OAuthUserProfile {
    identityId: string;
    email: string;
    name: string;
    avatar?: string;
    emailVerified: boolean;
    provider: 'google' | 'facebook' | 'tiktok';
}

@Injectable()
export class OAuthService {
    private googleClient: OAuth2Client;

    constructor(private configService: ConfigService) {
        console.log('1111111111', this.configService.get<string>('GOOGLE_CLIENT_ID'));
        this.googleClient = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
        );
    }

    async verifyGoogleToken(token: string): Promise<OAuthUserProfile> {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new UnauthorizedException('Invalid Google token');
            }

            return {
                identityId: payload.sub,
                email: payload.email || '',
                name: payload.name || `${payload.given_name} ${payload.family_name}`,
                avatar: payload.picture,
                emailVerified: payload.email_verified || false,
                provider: 'google',
            };
        } catch (error) {
            throw new UnauthorizedException(
                `Google token verification failed: ${error.message}`,
            );
        }
    }

    // Placeholder for future Facebook OAuth implementation
    async verifyFacebookToken(token: string): Promise<OAuthUserProfile> {
        // TODO: Implement Facebook token verification
        throw new Error('Facebook OAuth not implemented yet');
    }

    // Placeholder for future TikTok OAuth implementation
    async verifyTikTokToken(token: string): Promise<OAuthUserProfile> {
        // TODO: Implement TikTok token verification
        throw new Error('TikTok OAuth not implemented yet');
    }
}
