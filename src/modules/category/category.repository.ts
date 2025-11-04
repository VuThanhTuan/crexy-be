import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from '@/database/entities/category.entity';
import { CategoryQueryDto } from './dto/category-query.dto';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
    constructor(dataSource: DataSource) {
        super(dataSource, Category);
    }

    /**
     * Find categories with filters, sorting and pagination
     */
    async findWithFilters(query: CategoryQueryDto): Promise<[Category[], number]> {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            parentId,
            sortBy = 'createdAt', 
            sortOrder = 'DESC' 
        } = query;
        
        const queryBuilder = this.repository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.parent', 'parent')
            .leftJoinAndSelect('category.childrens', 'children');

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                '(category.name ILIKE :search OR category.slug ILIKE :search)', 
                { search: `%${search}%` }
            );
        }

        if (parentId !== undefined) {
            if (parentId === null || parentId === '') {
                // Get root categories (no parent)
                queryBuilder.andWhere('category.parentId IS NULL');
            } else {
                // Get categories with specific parent
                queryBuilder.andWhere('category.parentId = :parentId', { parentId });
            }
        }

        // Apply sorting
        queryBuilder.orderBy(`category.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return await queryBuilder.getManyAndCount();
    }

    /**
     * Find category by slug
     */
    async findBySlug(slug: string): Promise<Category | null> {
        return await this.repository.findOne({
            where: { slug },
            relations: ['parent', 'childrens']
        });
    }

    /**
     * Find category by ID with relations
     */
    async findByIdWithRelations(id: string): Promise<Category | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['parent', 'childrens', 'products']
        });
    }

    /**
     * Check if category is being used by any products
     */
    async isUsedByProducts(categoryId: string): Promise<boolean> {
        const count = await this.repository
            .createQueryBuilder('category')
            .leftJoin('category.products', 'product')
            .where('category.id = :categoryId', { categoryId })
            .andWhere('product.id IS NOT NULL')
            .getCount();
        
        return count > 0;
    }

    /**
     * Count products in category
     */
    async countProducts(categoryId: string): Promise<number> {
        const category = await this.repository.findOne({
            where: { id: categoryId },
            relations: ['products']
        });
        
        return category?.products?.length ?? 0;
    }

    /**
     * Check if category has child categories
     */
    async hasChildren(categoryId: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { parentId: categoryId }
        });
        
        return count > 0;
    }

    /**
     * Get all child categories (recursive)
     */
    async getChildrenRecursive(categoryId: string): Promise<Category[]> {
        const children = await this.repository.find({
            where: { parentId: categoryId },
            relations: ['childrens']
        });

        const allChildren: Category[] = [...children];

        for (const child of children) {
            const grandChildren = await this.getChildrenRecursive(child.id);
            allChildren.push(...grandChildren);
        }

        return allChildren;
    }

    /**
     * Override update method to return updated entity with relations
     */
    async update(id: string, categoryData: Partial<Category>): Promise<Category | null> {
        await this.repository.update(id, categoryData);
        return await this.findByIdWithRelations(id);
    }
}

