import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Category } from '@/database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto, PaginatedCategoryResponseDto } from './dto/category-response.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        // Validate parent category exists if parentId is provided
        if (createCategoryDto.parentId) {
            const parentExists = await this.categoryRepository.exists(createCategoryDto.parentId);
            if (!parentExists) {
                throw new NotFoundException(
                    `Không tìm thấy danh mục cha với ID: ${createCategoryDto.parentId}`
                );
            }
        }

        // Check if slug already exists
        if (createCategoryDto.slug) {
            const existingCategory = await this.categoryRepository.findBySlug(
                createCategoryDto.slug
            );

            if (existingCategory) {
                throw new ConflictException(
                    `Slug "${createCategoryDto.slug}" đã tồn tại`
                );
            }
        }

        try {
            const savedCategory = await this.categoryRepository.create(createCategoryDto);
            return await this.mapToResponseDto(savedCategory);
        } catch (error) {
            throw new BadRequestException('Không thể tạo danh mục: ' + error.message);
        }
    }

    async findAll(query: CategoryQueryDto): Promise<PaginatedCategoryResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [categories, total] = await this.categoryRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);
        
        const data = await Promise.all(
            categories.map(category => this.mapToResponseDto(category))
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
     * Public endpoint: get all categories without pagination, ordered by createdAt desc then name asc
     */
    async findAllForUser(): Promise<CategoryResponseDto[]> {
        const categories = await this.categoryRepository.findAllNoPagination();
        const data = await Promise.all(
            categories.map(category => this.mapToResponseDto(category))
        );
        return data;
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const category = await this.categoryRepository.findByIdWithRelations(id);

        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
        }
        
        return await this.mapToResponseDto(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const exists = await this.categoryRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
        }

        // Validate parent category exists if parentId is provided
        if (updateCategoryDto.parentId) {
            // Check if trying to set itself as parent
            if (updateCategoryDto.parentId === id) {
                throw new BadRequestException('Danh mục không thể là danh mục cha của chính nó');
            }

            const parentExists = await this.categoryRepository.exists(updateCategoryDto.parentId);
            if (!parentExists) {
                throw new NotFoundException(
                    `Không tìm thấy danh mục cha với ID: ${updateCategoryDto.parentId}`
                );
            }

            // Check if parent is a descendant of current category
            const children = await this.categoryRepository.getChildrenRecursive(id);
            const childIds = children.map(child => child.id);
            if (childIds.includes(updateCategoryDto.parentId)) {
                throw new BadRequestException(
                    'Không thể đặt danh mục con làm danh mục cha'
                );
            }
        }

        // If updating slug, check if new slug already exists
        if (updateCategoryDto.slug) {
            const existingCategory = await this.categoryRepository.findBySlug(
                updateCategoryDto.slug
            );

            if (existingCategory && existingCategory.id !== id) {
                throw new ConflictException(
                    `Slug "${updateCategoryDto.slug}" đã tồn tại`
                );
            }
        }

        try {
            const updatedCategory = await this.categoryRepository.update(id, updateCategoryDto);
            if (!updatedCategory) {
                throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
            }
            return await this.mapToResponseDto(updatedCategory);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật danh mục: ' + error.message);
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const exists = await this.categoryRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
        }

        // Check if category is being used by any products
        const isUsed = await this.categoryRepository.isUsedByProducts(id);
        if (isUsed) {
            throw new BadRequestException(
                'Không thể xóa danh mục này vì đang được sử dụng bởi một hoặc nhiều sản phẩm. Vui lòng xóa hoặc chuyển các sản phẩm sang danh mục khác trước.'
            );
        }

        // Check if category has children
        const hasChildren = await this.categoryRepository.hasChildren(id);
        if (hasChildren) {
            throw new BadRequestException(
                'Không thể xóa danh mục này vì có danh mục con. Vui lòng xóa hoặc chuyển các danh mục con trước.'
            );
        }

        try {
            const affected = await this.categoryRepository.delete(id);
            if (affected === 0) {
                throw new BadRequestException('Không thể xóa danh mục');
            }

            return { message: 'Xóa danh mục thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể xóa danh mục: ' + error.message);
        }
    }

    private async mapToResponseDto(category: Category): Promise<CategoryResponseDto> {
        const productCount = await this.categoryRepository.countProducts(category.id);

        const response: CategoryResponseDto = {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            backgroundImage: category.backgroundImage,
            parentId: category.parentId,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            productCount,
        };

        // Add parent if exists
        if (category.parent) {
            response.parent = {
                id: category.parent.id,
                name: category.parent.name,
                slug: category.parent.slug,
                description: category.parent.description,
                backgroundImage: category.parent.backgroundImage,
                parentId: category.parent.parentId,
                createdAt: category.parent.createdAt,
                updatedAt: category.parent.updatedAt,
            };
        }

        // Add children if exists
        if (category.childrens && category.childrens.length > 0) {
            response.children = category.childrens.map(child => ({
                id: child.id,
                name: child.name,
                slug: child.slug,
                description: child.description,
                backgroundImage: child.backgroundImage,
                parentId: child.parentId,
                createdAt: child.createdAt,
                updatedAt: child.updatedAt,
            }));
        }

        return response;
    }
}

