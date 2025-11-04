import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductColor } from '@/database/entities/product-color.entity';
import { ProductColorQueryDto } from './dto/product-color-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class ProductColorRepository extends BaseRepository<ProductColor> {
    constructor(dataSource: DataSource) {
        super(dataSource, ProductColor);
    }

    /**
     * Find product colors with filters, sorting and pagination
     */
    async findWithFilters(query: ProductColorQueryDto): Promise<[ProductColor[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('productColor');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('productColor.name ILIKE :search', { search: `%${search}%` });
        }

        // Apply sorting
        queryBuilder.orderBy(`productColor.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Find color by exact color code
     */
    async findByColorCode(colorCode: string): Promise<ProductColor | null> {
        return await this.repository.findOne({
            where: { colorCode }
        });
    }

    /**
     * Override update method to return updated entity
     */
    async update(id: string, colorData: Partial<ProductColor>): Promise<ProductColor | null> {
        await this.repository.update(id, colorData);
        return await this.findById(id);
    }
}

