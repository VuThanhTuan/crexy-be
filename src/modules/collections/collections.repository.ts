import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Collection } from '@/database/entities/colection.entity';
import { ProductCollection } from '@/database/entities/product-collection.entity';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class CollectionRepository extends BaseRepository<Collection> {
    constructor(dataSource: DataSource) {
        super(dataSource, Collection);
    }

    /**
     * Find collections with advanced filters, sorting and pagination
     */
    async findWithFilters(query: CollectionQueryDto): Promise<[Collection[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.media', 'media')
            .leftJoinAndSelect('collection.productCollections', 'productCollections')
            .leftJoinAndSelect('productCollections.product', 'product')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'productMediaMedia');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('collection.name ILIKE :search', { search: `%${search}%` });
        }

        // Apply sorting
        queryBuilder.orderBy(`collection.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Override base method to include relations
     */
    async findById(id: string): Promise<Collection | null> {
        return await this.repository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.media', 'media')
            .leftJoinAndSelect('collection.productCollections', 'productCollections')
            .leftJoinAndSelect('productCollections.product', 'product')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'productMediaMedia')
            .where('collection.id = :id', { id })
            .getOne();
    }

    /**
     * Override update method to return updated entity with relations
     */
    async update(id: string, collectionData: Partial<Collection>): Promise<Collection | null> {
        await this.repository.update(id, collectionData);
        return await this.findById(id);
    }

    /**
     * Check if collection has any products
     */
    async hasProducts(id: string): Promise<boolean> {
        const count = await this.dataSource
            .getRepository(ProductCollection)
            .count({ where: { collectionId: id } });

        return count > 0;
    }
}
