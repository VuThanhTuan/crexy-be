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

    // Apply sorting (primary sort, then secondary by name asc)
    queryBuilder.orderBy(`collection.${sortBy}`, sortOrder);
    queryBuilder.addOrderBy('collection.name', 'ASC');

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Find collections for public list endpoints: do not include full product relations
     */
    async findWithFiltersForList(query: CollectionQueryDto): Promise<[Collection[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.media', 'media');

        if (search) {
            queryBuilder.andWhere('collection.name ILIKE :search', { search: `%${search}%` });
        }

        queryBuilder.orderBy(`collection.${sortBy}`, sortOrder);
        queryBuilder.addOrderBy('collection.name', 'ASC');

        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Count products in a collection
     */
    async countProducts(collectionId: string): Promise<number> {
        const count = await this.dataSource
            .getRepository(ProductCollection)
            .count({ where: { collectionId } });
        return count;
    }

    /**
     * Find top N collections ordered by createdAt desc then name asc
     */
    async findTop(limit = 5): Promise<Collection[]> {
        const queryBuilder = this.repository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.media', 'media')
            .orderBy('collection.createdAt', 'DESC')
            .addOrderBy('collection.name', 'ASC')
            .take(limit);

        return await queryBuilder.getMany();
    }

    /**
     * Find collection by slug including relations (for detail)
     */
    async findBySlug(slug: string): Promise<Collection | null> {
        return await this.repository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.media', 'media')
            .leftJoinAndSelect('collection.productCollections', 'productCollections')
            .leftJoinAndSelect('productCollections.product', 'product')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'productMediaMedia')
            .where('collection.slug = :slug', { slug })
            .getOne();
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
