import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductSize } from '@/database/entities/product-size.entity';
import { ProductSizeQueryDto } from './dto/product-size-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class ProductSizeRepository extends BaseRepository<ProductSize> {
    constructor(dataSource: DataSource) {
        super(dataSource, ProductSize);
    }

    /**
     * Find product sizes with filters, sorting and pagination
     */
    async findWithFilters(query: ProductSizeQueryDto): Promise<[ProductSize[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('productSize');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('productSize.name ILIKE :search', { search: `%${search}%` });
        }

        // Apply sorting
        queryBuilder.orderBy(`productSize.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Find size by exact name
     */
    async findByName(name: string): Promise<ProductSize | null> {
        return await this.repository.findOne({
            where: { name }
        });
    }

    /**
     * Override update method to return updated entity
     */
    async update(id: string, sizeData: Partial<ProductSize>): Promise<ProductSize | null> {
        await this.repository.update(id, sizeData);
        return await this.findById(id);
    }
}



