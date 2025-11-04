import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Media } from '@/database/entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { MediaResponseDto, PaginatedMediaResponseDto, UploadMediaResponseDto } from './dto/media-response.dto';
import { MediaRepository } from './media.repository';
import { AwsS3Service } from './aws-s3.service';
import * as sharp from 'sharp';

@Injectable()
export class MediaService {
    constructor(
        private readonly mediaRepository: MediaRepository,
        private readonly awsS3Service: AwsS3Service,
    ) {}

    /**
     * Upload file to S3 and create media record
     */
    async uploadFile(file: Express.Multer.File, userId?: string): Promise<UploadMediaResponseDto> {
        try {
            // Upload to S3
            const uploadResult = await this.awsS3Service.uploadFile(file, 'media');

            // Get image dimensions if it's an image
            let width: number | undefined;
            let height: number | undefined;

            if (file.mimetype.startsWith('image/')) {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    width = metadata.width;
                    height = metadata.height;
                } catch (error) {
                    console.warn('Could not extract image dimensions:', error);
                }
            }

            // Determine media type
            const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

            // Create media record
            const createMediaDto: CreateMediaDto = {
                name: uploadResult.key,
                originName: file.originalname,
                mediaType,
                mimeType: file.mimetype,
                url: uploadResult.url,
                size: file.size,
                width,
                height,
            };

            const savedMedia = await this.mediaRepository.create({
                ...createMediaDto,
                createdUserId: userId,
            });

            return {
                message: 'Upload file thành công',
                data: this.mapToResponseDto(savedMedia),
            };
        } catch (error) {
            throw new BadRequestException('Không thể upload file: ' + error.message);
        }
    }

    /**
     * Create media record manually (without upload)
     */
    async create(createMediaDto: CreateMediaDto, userId?: string): Promise<MediaResponseDto> {
        try {
            const savedMedia = await this.mediaRepository.create({
                ...createMediaDto,
                createdUserId: userId,
            });
            return this.mapToResponseDto(savedMedia);
        } catch (error) {
            throw new BadRequestException('Không thể tạo media: ' + error.message);
        }
    }

    /**
     * Find all media with filters
     */
    async findAll(query: MediaQueryDto): Promise<PaginatedMediaResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [mediaList, total] = await this.mediaRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);

        // Check usage for each media
        const data = await Promise.all(
            mediaList.map(async (media) => {
                const isInUse = await this.mediaRepository.isInUse(media.id);
                return this.mapToResponseDto(media, isInUse);
            })
        );
        
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Find one media by ID
     */
    async findOne(id: string): Promise<MediaResponseDto> {
        const media = await this.mediaRepository.findById(id);

        if (!media) {
            throw new NotFoundException(`Không tìm thấy media với ID: ${id}`);
        }

        const isInUse = await this.mediaRepository.isInUse(id);
        return this.mapToResponseDto(media, isInUse);
    }

    /**
     * Update media metadata
     */
    async update(id: string, updateMediaDto: UpdateMediaDto, userId?: string): Promise<MediaResponseDto> {
        const exists = await this.mediaRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy media với ID: ${id}`);
        }

        try {
            const updatedMedia = await this.mediaRepository.update(id, {
                ...updateMediaDto,
                updatedUserId: userId,
            });
            
            if (!updatedMedia) {
                throw new NotFoundException(`Không tìm thấy media với ID: ${id}`);
            }

            const isInUse = await this.mediaRepository.isInUse(id);
            return this.mapToResponseDto(updatedMedia, isInUse);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật media: ' + error.message);
        }
    }

    /**
     * Delete media (only if not in use)
     */
    async delete(id: string): Promise<{ message: string }> {
        const media = await this.mediaRepository.findById(id);
        if (!media) {
            throw new NotFoundException(`Không tìm thấy media với ID: ${id}`);
        }

        // Check if media is being used
        const isInUse = await this.mediaRepository.isInUse(id);
        if (isInUse) {
            const usage = await this.mediaRepository.getUsageDetails(id);
            throw new ConflictException(
                `Không thể xóa media này vì đang được sử dụng (${usage.products} sản phẩm, ${usage.collections} collection)`
            );
        }

        try {
            // Delete from S3 if it's an S3 URL
            if (this.awsS3Service.isS3Url(media.url)) {
                const key = this.awsS3Service.extractKeyFromUrl(media.url);
                await this.awsS3Service.deleteFile(key);
            }

            // Delete from database
            const affected = await this.mediaRepository.delete(id);
            if (affected === 0) {
                throw new BadRequestException('Không thể xóa media');
            }

            return { message: 'Xóa media thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Không thể xóa media: ' + error.message);
        }
    }

    /**
     * Get media usage details
     */
    async getUsageDetails(id: string): Promise<{ products: number; collections: number }> {
        const exists = await this.mediaRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy media với ID: ${id}`);
        }

        return await this.mediaRepository.getUsageDetails(id);
    }

    /**
     * Map entity to response DTO
     */
    private mapToResponseDto(media: Media, isInUse?: boolean): MediaResponseDto {
        return {
            id: media.id,
            name: media.name,
            originName: media.originName,
            mediaType: media.mediaType,
            mimeType: media.mimeType,
            url: media.url,
            size: media.size,
            width: media.width,
            height: media.height,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
            isInUse,
        };
    }
}

