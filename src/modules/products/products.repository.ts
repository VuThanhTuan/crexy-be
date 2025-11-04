import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '@/database/entities/product.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
    constructor(dataSource: DataSource) {
        super(dataSource, Product);
    }

    /**
     * Find products with advanced filters, sorting and pagination
     */
    async findWithFilters(query: ProductQueryDto): Promise<[Product[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            categoryId, 
            isActive, 
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.discount', 'discount')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'media');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
        }

        if (categoryId) {
            queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('product.isActive = :isActive', { isActive });
        }

        // Apply sorting
        queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Override base method to include relations
     */
    async findById(id: string): Promise<Product | null> {
        return await this.repository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.discount', 'discount')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'media')
            .leftJoinAndSelect('product.productVariants', 'productVariants')
            .leftJoinAndSelect('productVariants.productSize', 'productSize')
            .leftJoinAndSelect('productVariants.productColor', 'productColor')
            .leftJoinAndSelect('product.productAttributes', 'productAttributes')
            .where('product.id = :id', { id })
            .getOne();
    }

    /**
     * Find published product by ID with all relations
     */
    async findOnePublished(id: string): Promise<Product | null> {
        return await this.repository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.discount', 'discount')
            .leftJoinAndSelect('product.productMedia', 'productMedia')
            .leftJoinAndSelect('productMedia.media', 'media')
            .leftJoinAndSelect('product.productVariants', 'productVariants')
            .leftJoinAndSelect('productVariants.productSize', 'productSize')
            .leftJoinAndSelect('productVariants.productColor', 'productColor')
            .leftJoinAndSelect('product.productAttributes', 'productAttributes')
            .where('product.id = :id', { id })
            .andWhere('product.isActive = :isActive', { isActive: true })
            .getOne();
    }

    /**
     * Override update method to return updated entity with relations
     */
    async update(id: string, productData: Partial<Product>): Promise<Product | null> {
        await this.repository.update(id, productData);
        return await this.findById(id);
    }
}

