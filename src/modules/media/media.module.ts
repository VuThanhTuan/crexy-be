import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MediaService } from './media.service';
import { AdminMediaController } from './admin-media.controller';
import { MediaRepository } from './media.repository';
import { AwsS3Service } from './aws-s3.service';
import { Media } from '@/database/entities/media.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Media]),
    ],
    controllers: [AdminMediaController],
    providers: [MediaRepository, MediaService, AwsS3Service],
    exports: [MediaService, MediaRepository, AwsS3Service],
})
export class MediaModule {}

