import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { OAuthService } from './oauth.service';
import { JwtStrategy } from './admin-auth.strategy';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '3m' },
    })
  ],
  controllers: [AdminAuthController, AuthController],
  providers: [AuthService, OAuthService, JwtStrategy],
  exports: [],
})
export class AuthModule {}
