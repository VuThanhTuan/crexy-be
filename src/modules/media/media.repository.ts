import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Media } from '@/database/entities/media.entity';
import { MediaQueryDto } from './dto/media-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class MediaRepository extends BaseRepository<Media> {
    constructor(dataSource: DataSource) {
        super(dataSource, Media);
    }

    /**
     * Find media with filters, sorting and pagination
     */
    async findWithFilters(query: MediaQueryDto): Promise<[Media[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            mediaType,
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('media');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('media.originName ILIKE :search', { search: `%${search}%` });
        }

        if (mediaType) {
            queryBuilder.andWhere('media.mediaType = :mediaType', { mediaType });
        }

        // Apply sorting
        queryBuilder.orderBy(`media.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Check if media is being used in product_media table
     */
    async isUsedInProducts(mediaId: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT COUNT(*) as count FROM product_media WHERE media_id = $1',
            [mediaId]
        );
        return parseInt(result[0].count) > 0;
    }

    /**
     * Check if media is being used in collections table
     */
    async isUsedInCollections(mediaId: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT COUNT(*) as count FROM collections WHERE media_id = $1',
            [mediaId]
        );
        return parseInt(result[0].count) > 0;
    }

    /**
     * Check if media is being used anywhere
     */
    async isInUse(mediaId: string): Promise<boolean> {
        const [inProducts, inCollections] = await Promise.all([
            this.isUsedInProducts(mediaId),
            this.isUsedInCollections(mediaId)
        ]);
        return inProducts || inCollections;
    }

    /**
     * Get media usage details
     */
    async getUsageDetails(mediaId: string): Promise<{ products: number; collections: number }> {
        const [productsResult, collectionsResult] = await Promise.all([
            this.dataSource.query(
                'SELECT COUNT(*) as count FROM product_media WHERE media_id = $1',
                [mediaId]
            ),
            this.dataSource.query(
                'SELECT COUNT(*) as count FROM collections WHERE media_id = $1',
                [mediaId]
            )
        ]);

        return {
            products: parseInt(productsResult[0].count),
            collections: parseInt(collectionsResult[0].count)
        };
    }

    /**
     * Override update method to return updated entity
     */
    async update(id: string, mediaData: Partial<Media>): Promise<Media | null> {
        await this.repository.update(id, mediaData);
        return await this.findById(id);
    }
}

