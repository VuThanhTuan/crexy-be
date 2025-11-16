import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Collection } from '@/database/entities/colection.entity';
import { ProductCollection } from '@/database/entities/product-collection.entity';
import { Product } from '@/database/entities/product.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto, PaginatedCollectionResponseDto } from './dto/collection-response.dto';
import { CollectionRepository } from './collections.repository';
import { MEDIA_CATEGORY } from '@/common/consts/app';

@Injectable()
export class CollectionsService {
    constructor(
        private readonly collectionRepository: CollectionRepository,
        private readonly dataSource: DataSource,
    ) {}

    async create(createCollectionDto: CreateCollectionDto): Promise<CollectionResponseDto> {
        try {
            return await this.collectionRepository.withTransaction(async (queryRunner) => {
                // 1. Create collection
                const collection = queryRunner.manager.create(Collection, {
                    name: createCollectionDto.name,
                    description: createCollectionDto.description,
                    slug: createCollectionDto.slug,
                    mediaId: createCollectionDto.mediaId,
                });
                const savedCollection = await queryRunner.manager.save(collection);

                // 2. Add products if provided
                if (createCollectionDto.productIds && createCollectionDto.productIds.length > 0) {
                    // Validate products exist
                    const products = await queryRunner.manager.findByIds(Product, createCollectionDto.productIds);
                    if (products.length !== createCollectionDto.productIds.length) {
                        throw new BadRequestException('Một số sản phẩm không tồn tại');
                    }

                    // Create product-collection relationships
                    const productCollections = createCollectionDto.productIds.map((productId, index) => {
                        return queryRunner.manager.create(ProductCollection, {
                            collectionId: savedCollection.id,
                            productId: productId,
                            order: index,
                        });
                    });
                    await queryRunner.manager.save(productCollections);
                }

                // 3. Reload collection with all relations
                const collectionWithRelations = await queryRunner.manager
                    .createQueryBuilder(Collection, 'collection')
                    .leftJoinAndSelect('collection.media', 'media')
                    .leftJoinAndSelect('collection.productCollections', 'productCollections')
                    .leftJoinAndSelect('productCollections.product', 'product')
                    .where('collection.id = :id', { id: savedCollection.id })
                    .getOne();

                return this.mapToResponseDto(collectionWithRelations!);
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể tạo bộ sưu tập');
        }
    }

    async findAll(query: CollectionQueryDto): Promise<PaginatedCollectionResponseDto> {
        const [collections, total] = await this.collectionRepository.findWithFilters(query);

        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return {
            data: collections.map(collection => this.mapToResponseDto(collection)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<CollectionResponseDto> {
        const collection = await this.collectionRepository.findById(id);
        if (!collection) {
            throw new NotFoundException('Không tìm thấy bộ sưu tập');
        }
        return this.mapToResponseDto(collection);
    }

    /**
     * Public: get top collections for menu (no pagination)
     */
    async findTopForMenu(limit = 5): Promise<CollectionResponseDto[]> {
        const collections = await this.collectionRepository.findTop(limit);
        // For menu we don't include product list, but include productCount
        const data = await Promise.all(collections.map(async (c) => {
            const productCount = await this.collectionRepository.countProducts(c.id);
            return {
                id: c.id,
                name: c.name,
                description: c.description || undefined,
                slug: c.slug || undefined,
                media: c.media ? {
                    id: c.media.id,
                    name: c.media.name,
                    url: c.media.url,
                    mimeType: c.media.mimeType || undefined,
                } : undefined,
                products: undefined,
                productCount,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            } as CollectionResponseDto;
        }));

        return data;
    }

    /**
     * Public: paginated list for users (no products in items)
     */
    async findAllForUser(query: CollectionQueryDto): Promise<PaginatedCollectionResponseDto> {
        const [collections, total] = await this.collectionRepository.findWithFiltersForList(query);

        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(total / limit);

        const data = await Promise.all(collections.map(async (c) => {
            const productCount = await this.collectionRepository.countProducts(c.id);
            return {
                id: c.id,
                name: c.name,
                description: c.description || undefined,
                slug: c.slug || undefined,
                media: c.media ? {
                    id: c.media.id,
                    name: c.media.name,
                    url: c.media.url,
                    mimeType: c.media.mimeType || undefined,
                } : undefined,
                products: undefined,
                productCount,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            } as CollectionResponseDto;
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Find collection detail by slug (includes products)
     */
    async findOneBySlug(slug: string): Promise<CollectionResponseDto> {
        const collection = await this.collectionRepository.findBySlug(slug);
        if (!collection) {
            throw new NotFoundException('Không tìm thấy bộ sưu tập');
        }
        return this.mapToResponseDto(collection);
    }

    async update(id: string, updateCollectionDto: UpdateCollectionDto): Promise<CollectionResponseDto> {
        const collection = await this.collectionRepository.findById(id);
        if (!collection) {
            throw new NotFoundException('Không tìm thấy bộ sưu tập');
        }

        try {
            return await this.collectionRepository.withTransaction(async (queryRunner) => {
                // 1. Update collection basic info
                if (updateCollectionDto.name || updateCollectionDto.description !== undefined || 
                    updateCollectionDto.slug !== undefined || updateCollectionDto.mediaId !== undefined) {
                    await queryRunner.manager.update(Collection, id, {
                        name: updateCollectionDto.name,
                        description: updateCollectionDto.description,
                        slug: updateCollectionDto.slug,
                        mediaId: updateCollectionDto.mediaId,
                    });
                }

                // 2. Update products if provided
                if (updateCollectionDto.productIds !== undefined) {
                    // Remove existing product-collection relationships
                    await queryRunner.manager.delete(ProductCollection, { collectionId: id });

                    // Add new relationships if productIds is not empty
                    if (updateCollectionDto.productIds.length > 0) {
                        // Validate products exist
                        const products = await queryRunner.manager.findByIds(Product, updateCollectionDto.productIds);
                        if (products.length !== updateCollectionDto.productIds.length) {
                            throw new BadRequestException('Một số sản phẩm không tồn tại');
                        }

                        // Create new product-collection relationships
                        const productCollections = updateCollectionDto.productIds.map((productId, index) => {
                            return queryRunner.manager.create(ProductCollection, {
                                collectionId: id,
                                productId: productId,
                                order: index,
                            });
                        });
                        await queryRunner.manager.save(productCollections);
                    }
                }

                // 3. Reload collection with all relations
                const updatedCollection = await queryRunner.manager
                    .createQueryBuilder(Collection, 'collection')
                    .leftJoinAndSelect('collection.media', 'media')
                    .leftJoinAndSelect('collection.productCollections', 'productCollections')
                    .leftJoinAndSelect('productCollections.product', 'product')
                    .where('collection.id = :id', { id })
                    .getOne();

                return this.mapToResponseDto(updatedCollection!);
            });
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật bộ sưu tập');
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const collection = await this.collectionRepository.findById(id);
        if (!collection) {
            throw new NotFoundException('Không tìm thấy bộ sưu tập');
        }

        // Check if collection has products
        const hasProducts = await this.collectionRepository.hasProducts(id);
        if (hasProducts) {
            throw new BadRequestException('Không thể xóa bộ sưu tập có sản phẩm. Vui lòng xóa tất cả sản phẩm trước khi xóa bộ sưu tập.');
        }

        await this.collectionRepository.delete(id);
        return { message: 'Xóa bộ sưu tập thành công' };
    }

    private mapToResponseDto(collection: Collection): CollectionResponseDto {
        return {
            id: collection.id,
            name: collection.name,
            description: collection.description || undefined,
            slug: collection.slug || undefined,
            media: collection.media ? {
                id: collection.media.id,
                name: collection.media.name,
                url: collection.media.url,
                mimeType: collection.media.mimeType || undefined,
            } : undefined,
            products: collection.productCollections?.map(pc => {
                const primaryMedia = pc.product.productMedia?.find(
                    pm => pm.mediaCategory === MEDIA_CATEGORY.PRIMARY && pm.media
                );
                return {
                    id: pc.product.id,
                    name: pc.product.name,
                    price: pc.product.price,
                    primaryImage: primaryMedia?.media ? {
                        id: primaryMedia.media.id,
                        name: primaryMedia.media.name,
                        originName: primaryMedia.media.originName,
                        url: primaryMedia.media.url,
                        mediaType: primaryMedia.media.mediaType,
                        mimeType: primaryMedia.media.mimeType,
                        size: primaryMedia.media.size,
                        width: primaryMedia.media.width,
                        height: primaryMedia.media.height,
                    } : undefined,
                };
            }) || [],
            productCount: collection.productCollections?.length || 0,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
        };
    }
}
