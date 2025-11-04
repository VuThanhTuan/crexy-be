import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Discount } from '@/database/entities/discount.entity';
import { DiscountQueryDto } from './dto/discount-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class DiscountRepository extends BaseRepository<Discount> {
    constructor(dataSource: DataSource) {
        super(dataSource, Discount);
    }

    /**
     * Find discounts with filters, sorting and pagination
     */
    async findWithFilters(query: DiscountQueryDto): Promise<[Discount[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            discountType,
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('discount');

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                'discount.name ILIKE :search', 
                { search: `%${search}%` }
            );
        }

        if (discountType) {
            queryBuilder.andWhere('discount.discountType = :discountType', { discountType });
        }

        // Apply sorting
        queryBuilder.orderBy(`discount.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Find discount by ID with relations
     */
    async findByIdWithRelations(id: string): Promise<Discount | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['products']
        });
    }

    /**
     * Check if discount is being used by any products
     */
    async isUsedByProducts(discountId: string): Promise<boolean> {
        const count = await this.repository
            .createQueryBuilder('discount')
            .leftJoin('discount.products', 'product')
            .where('discount.id = :discountId', { discountId })
            .andWhere('product.id IS NOT NULL')
            .getCount();
        
        return count > 0;
    }

    /**
     * Count products using this discount
     */
    async countProducts(discountId: string): Promise<number> {
        const discount = await this.repository.findOne({
            where: { id: discountId },
            relations: ['products']
        });
        
        return discount?.products?.length ?? 0;
    }

    /**
     * Override update method to return updated entity with relations
     */
    async update(id: string, discountData: Partial<Discount>): Promise<Discount | null> {
        await this.repository.update(id, discountData);
        return await this.findByIdWithRelations(id);
    }
}

