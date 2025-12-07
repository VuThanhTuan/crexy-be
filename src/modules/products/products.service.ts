import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '@/database/entities/product.entity';
import { ProductVariant } from '@/database/entities/product-variant.entity';
import { ProductMedia } from '@/database/entities/product-media.entity';
import { ProductAttribute } from '@/database/entities/product-attribute.entity';
import { ProductSize } from '@/database/entities/product-size.entity';
import { ProductColor } from '@/database/entities/product-color.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto, PaginatedProductResponseDto, ProductSummaryResponseDto } from './dto/product-response.dto';
import { ProductVariantDto } from './dto/product-variant.dto';
import { ProductMediaDto } from './dto/product-media.dto';
import { ProductAttributeDto } from './dto/product-attribute.dto';
import { ProductRepository } from './products.repository';
import { MEDIA_CATEGORY } from '@/common/consts/app';

@Injectable()
export class ProductsService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly dataSource: DataSource,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        // Validate media
        this.validateMediaItems(createProductDto.mediaItems);
        
        // Validate variants
        this.validateVariants(createProductDto.variants);

        try {
            return await this.productRepository.withTransaction(async (queryRunner) => {
                // 1. Create product
                const product = queryRunner.manager.create(Product, {
                    name: createProductDto.name,
                    description: createProductDto.description,
                    isActive: createProductDto.isActive ?? true,
                    categoryId: createProductDto.categoryId,
                    discountId: createProductDto.discountId,
                    price: createProductDto.price,
                });
                const savedProduct = await queryRunner.manager.save(product);

                // 2. Create product variants
                const variantEntities = await Promise.all(
                    createProductDto.variants.map(async (variantDto) => {
                        // Generate variant name if not provided
                        let variantName = variantDto.name;
                        if (!variantName) {
                            const sizeName = variantDto.sizeId 
                                ? (await queryRunner.manager.findOne(ProductSize, { where: { id: variantDto.sizeId } }))?.name 
                                : null;
                            const colorName = variantDto.colorId 
                                ? (await queryRunner.manager.findOne(ProductColor, { where: { id: variantDto.colorId } }))?.name 
                                : null;
                            
                            variantName = [colorName, sizeName].filter(Boolean).join(' - ') || savedProduct.name;
                        }

                        return queryRunner.manager.create(ProductVariant, {
                            productId: savedProduct.id,
                            productSizeId: variantDto.sizeId,
                            productColorId: variantDto.colorId,
                            name: variantName,
                            description: variantDto.description,
                            isActive: variantDto.isActive ?? false,
                            price: variantDto.price,
                        });
                    })
                );
                await queryRunner.manager.save(variantEntities);

                // 3. Create product media
                const mediaEntities = createProductDto.mediaItems.map((mediaDto) => {
                    return queryRunner.manager.create(ProductMedia, {
                        productId: savedProduct.id,
                        mediaId: mediaDto.mediaId,
                        mediaCategory: mediaDto.mediaCategory,
                    });
                });
                await queryRunner.manager.save(mediaEntities);

                // 4. Create product attributes if provided
                if (createProductDto.productAttributes && createProductDto.productAttributes.length > 0) {
                    const attributeEntities = createProductDto.productAttributes.map((attributeDto) => {
                        return queryRunner.manager.create(ProductAttribute, {
                            productId: savedProduct.id,
                            name: attributeDto.name,
                            value: attributeDto.value,
                        });
                    });
                    await queryRunner.manager.save(attributeEntities);
                }

                // 5. Reload product with all relations using queryRunner.manager
                const productWithRelations = await queryRunner.manager
                    .createQueryBuilder(Product, 'product')
                    .leftJoinAndSelect('product.category', 'category')
                    .leftJoinAndSelect('product.discount', 'discount')
                    .leftJoinAndSelect('product.productMedia', 'productMedia')
                    .leftJoinAndSelect('productMedia.media', 'media')
                    .leftJoinAndSelect('product.productVariants', 'productVariants')
                    .leftJoinAndSelect('productVariants.productSize', 'productSize')
                    .leftJoinAndSelect('productVariants.productColor', 'productColor')
                    .leftJoinAndSelect('product.productAttributes', 'productAttributes')
                    .where('product.id = :id', { id: savedProduct.id })
                    .getOne();

                if (!productWithRelations) {
                    throw new Error('Không thể tải sản phẩm sau khi tạo');
                }

                return this.mapToResponseDto(productWithRelations);
            });
        } catch (error) {
            throw new BadRequestException('Không thể tạo sản phẩm: ' + error.message);
        }
    }

    /**
     * Smart update variants: Compare old vs new, update/delete/insert accordingly
     */
    private async smartUpdateVariants(
        queryRunner: any,
        productId: string,
        existingVariants: ProductVariant[],
        newVariants: ProductVariantDto[],
        productName: string
    ): Promise<void> {
        // Create lookup map for existing variants by combination of sizeId + colorId
        const existingVariantsMap = new Map<string, ProductVariant>();
        existingVariants.forEach(variant => {
            const key = `${variant.productSizeId || 'null'}-${variant.productColorId || 'null'}`;
            existingVariantsMap.set(key, variant);
        });

        // Track which variants to keep
        const variantsToKeep = new Set<string>();

        // Process new variants
        for (const variantDto of newVariants) {
            const key = `${variantDto.sizeId || 'null'}-${variantDto.colorId || 'null'}`;
            variantsToKeep.add(key);

            const existingVariant = existingVariantsMap.get(key);

                if (existingVariant) {
                // UPDATE: Variant already exists, update it
                const updateData: any = {
                    isActive: variantDto.isActive ?? false,
                };

                // Update name if provided, otherwise regenerate
                if (variantDto.name) {
                    updateData.name = variantDto.name;
                } else {
                    const sizeName = variantDto.sizeId 
                        ? (await queryRunner.manager.findOne(ProductSize, { where: { id: variantDto.sizeId } }))?.name 
                        : null;
                    const colorName = variantDto.colorId 
                        ? (await queryRunner.manager.findOne(ProductColor, { where: { id: variantDto.colorId } }))?.name 
                        : null;
                    updateData.name = [colorName, sizeName].filter(Boolean).join(' - ') || productName;
                }

                if (variantDto.description !== undefined) {
                    updateData.description = variantDto.description;
                }

                if (variantDto.price !== undefined) {
                    updateData.price = variantDto.price;
                }

                await queryRunner.manager.update(ProductVariant, existingVariant.id, updateData);
            } else {
                // INSERT: New variant, create it
                let variantName = variantDto.name;
                if (!variantName) {
                    const sizeName = variantDto.sizeId 
                        ? (await queryRunner.manager.findOne(ProductSize, { where: { id: variantDto.sizeId } }))?.name 
                        : null;
                    const colorName = variantDto.colorId 
                        ? (await queryRunner.manager.findOne(ProductColor, { where: { id: variantDto.colorId } }))?.name 
                        : null;
                    variantName = [colorName, sizeName].filter(Boolean).join(' - ') || productName;
                }

                const newVariant = queryRunner.manager.create(ProductVariant, {
                    productId,
                    productSizeId: variantDto.sizeId,
                    productColorId: variantDto.colorId,
                    name: variantName,
                    description: variantDto.description,
                    isActive: variantDto.isActive ?? false,
                    price: variantDto.price,
                });
                await queryRunner.manager.save(newVariant);
            }
        }

        // DELETE: Remove variants that are no longer in the new list
        const variantsToDelete = existingVariants
            .filter(variant => {
                const key = `${variant.productSizeId || 'null'}-${variant.productColorId || 'null'}`;
                return !variantsToKeep.has(key);
            })
            .map(variant => variant.id);

        if (variantsToDelete.length > 0) {
            await queryRunner.manager.delete(ProductVariant, variantsToDelete);
        }
    }

    /**
     * Smart update media: Compare old vs new, update/delete/insert accordingly
     */
    private async smartUpdateMedia(
        queryRunner: any,
        productId: string,
        existingMedia: ProductMedia[],
        newMedia: ProductMediaDto[]
    ): Promise<void> {
        // Create lookup map for existing media by mediaId + mediaCategory
        const existingMediaMap = new Map<string, ProductMedia>();
        existingMedia.forEach(media => {
            const key = `${media.mediaId}-${media.mediaCategory}`;
            existingMediaMap.set(key, media);
        });

        // Track which media to keep
        const mediaToKeep = new Set<string>();

        // Process new media
        for (const mediaDto of newMedia) {
            const key = `${mediaDto.mediaId}-${mediaDto.mediaCategory}`;
            mediaToKeep.add(key);

            const existingMediaItem = existingMediaMap.get(key);

            if (existingMediaItem) {
                // Already exists, keep it (no need to update as mediaId and category don't change)
                continue;
            } else {
                // INSERT: New media, create it
                const newMediaItem = queryRunner.manager.create(ProductMedia, {
                    productId,
                    mediaId: mediaDto.mediaId,
                    mediaCategory: mediaDto.mediaCategory,
                });
                await queryRunner.manager.save(newMediaItem);
            }
        }

        // DELETE: Remove media that are no longer in the new list
        const mediaToDelete = existingMedia
            .filter(media => {
                const key = `${media.mediaId}-${media.mediaCategory}`;
                return !mediaToKeep.has(key);
            })
            .map(media => media.id);

        if (mediaToDelete.length > 0) {
            await queryRunner.manager.delete(ProductMedia, mediaToDelete);
        }
    }

    /**
     * Smart update attributes: Compare old vs new, update/delete/insert accordingly
     */
    private async smartUpdateAttributes(
        queryRunner: any,
        productId: string,
        existingAttributes: ProductAttribute[],
        newAttributes: ProductAttributeDto[]
    ): Promise<void> {
        // Create lookup map for existing attributes by name + value
        const existingAttributesMap = new Map<string, ProductAttribute>();
        existingAttributes.forEach(attribute => {
            const key = `${attribute.name}-${attribute.value}`;
            existingAttributesMap.set(key, attribute);
        });

        // Track which attributes to keep
        const attributesToKeep = new Set<string>();

        // Process new attributes
        for (const attributeDto of newAttributes) {
            const key = `${attributeDto.name}-${attributeDto.value}`;
            attributesToKeep.add(key);

            const existingAttribute = existingAttributesMap.get(key);

            if (existingAttribute) {
                // Already exists, keep it (no need to update as name and value don't change)
                continue;
            } else {
                // INSERT: New attribute, create it
                const newAttribute = queryRunner.manager.create(ProductAttribute, {
                    productId,
                    name: attributeDto.name,
                    value: attributeDto.value,
                });
                await queryRunner.manager.save(newAttribute);
            }
        }

        // DELETE: Remove attributes that are no longer in the new list
        const attributesToDelete = existingAttributes
            .filter(attribute => {
                const key = `${attribute.name}-${attribute.value}`;
                return !attributesToKeep.has(key);
            })
            .map(attribute => attribute.id);

        if (attributesToDelete.length > 0) {
            await queryRunner.manager.delete(ProductAttribute, attributesToDelete);
        }
    }

    private validateMediaItems(mediaItems: CreateProductDto['mediaItems']): void {
        // Check for at least one preview image
        const previewImages = mediaItems.filter(item => item.mediaCategory === MEDIA_CATEGORY.PRIMARY);
        if (previewImages.length === 0) {
            throw new BadRequestException('Phải có ít nhất 1 ảnh đại diện (primary)');
        }

        if (previewImages.length > 1) {
            throw new BadRequestException('Chỉ được có tối đa 1 ảnh đại diện (primary)');
        }

        // Check for max 10 detail_list images
        const detailListImages = mediaItems.filter(item => item.mediaCategory === MEDIA_CATEGORY.SLIDER);
        if (detailListImages.length > 10) {
            throw new BadRequestException('Chỉ được có tối đa 10 ảnh slide (detail_list)');
        }
    }

    private validateVariants(variants: CreateProductDto['variants']): void {
        // Check for at least one active variant
        const activeVariants = variants.filter(variant => variant.isActive);
        if (activeVariants.length === 0) {
            throw new BadRequestException('Phải có ít nhất 1 biến thể (variant) active');
        }

        // Check for duplicate combinations
        const combinations = new Set<string>();
        for (const variant of variants) {
            const key = `${variant.sizeId || 'null'}-${variant.colorId || 'null'}`;
            if (combinations.has(key)) {
                throw new BadRequestException('Không được phép có biến thể trùng lặp (cùng size và màu)');
            }
            combinations.add(key);
        }
    }

    async findAll(query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [products, total] = await this.productRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: products.map(product => this.mapToResponseDto(product)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
        }
        return this.mapToResponseDto(product);
    }

    async findOnePublished(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepository.findOnePublished(id);

        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
        }
        return this.mapToResponseDto(product);
    }

    async findAllPublished(query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
        const publishedQuery = { ...query, isActive: true };
        return await this.findAll(publishedQuery);
    }

    /**
     * Public: get top latest published products (for homepage)
     */
    async findTopLatest(limit = 4, categoryId?: string): Promise<ProductSummaryResponseDto[]> {
        const products = await this.productRepository.findLatestPublished(limit, categoryId);
        return products.map(product => {
            const primaryMedia = product.productMedia?.find(
                pm => pm.mediaCategory === MEDIA_CATEGORY.PRIMARY && pm.media
            );
            const secondaryMedia = product.productMedia?.find(
                pm => pm.mediaCategory === MEDIA_CATEGORY.SECONDARY && pm.media
            );

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category ? {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                } : undefined,
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
                secondaryImage: secondaryMedia?.media ? {
                    id: secondaryMedia.media.id,
                    name: secondaryMedia.media.name,
                    originName: secondaryMedia.media.originName,
                    url: secondaryMedia.media.url,
                    mediaType: secondaryMedia.media.mediaType,
                    mimeType: secondaryMedia.media.mimeType,
                    size: secondaryMedia.media.size,
                    width: secondaryMedia.media.width,
                    height: secondaryMedia.media.height,
                } : undefined,
                discount: product.discount ? {
                    id: product.discount.id,
                    name: product.discount.name,
                    discountValue: product.discount.discountValue,
                    discountType: product.discount.discountType,
                } : undefined,
                productVariants: product.productVariants?.map(variant => ({
                    id: variant.id,
                    name: variant.name,
                    description: variant.description,
                    isActive: variant.isActive,
                    productSizeId: variant.productSizeId,
                    productColorId: variant.productColorId,
                    price: variant.price,
                    productSize: variant.productSize ? {
                        id: variant.productSize.id,
                        name: variant.productSize.name,
                        description: variant.productSize.description,
                    } : undefined,
                    productColor: variant.productColor ? {
                        id: variant.productColor.id,
                        name: variant.productColor.name,
                        colorCode: variant.productColor.colorCode,
                        description: variant.productColor.description,
                    } : undefined,
                    createdAt: variant.createdAt,
                    updatedAt: variant.updatedAt,
                })),
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            } as ProductSummaryResponseDto;
        });
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        // Check if product exists
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
        }

        // Validate media if provided
        if (updateProductDto.mediaItems) {
            this.validateMediaItems(updateProductDto.mediaItems);
        } else {
            // If not updating media, check if current product has at least 1 preview
            if (!existingProduct.productMedia || existingProduct.productMedia.length === 0) {
                throw new BadRequestException('Sản phẩm phải có ít nhất 1 ảnh đại diện');
            }
        }

        // Validate variants if provided
        if (updateProductDto.variants) {
            this.validateVariants(updateProductDto.variants);
        }

        try {
            return await this.productRepository.withTransaction(async (queryRunner) => {
                // 1. Update product basic info
                const updateData: any = {};
                if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
                if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description;
                if (updateProductDto.isActive !== undefined) updateData.isActive = updateProductDto.isActive;
                if (updateProductDto.categoryId !== undefined) updateData.categoryId = updateProductDto.categoryId;
                if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
                
                // Handle discountId: if explicitly passed (even as null), update it
                if ('discountId' in updateProductDto) {
                    updateData.discountId = updateProductDto.discountId || null;
                }

                if (Object.keys(updateData).length > 0) {
                    await queryRunner.manager.update(Product, id, updateData);
                }

                // 2. Smart update variants if provided
                if (updateProductDto.variants) {
                    await this.smartUpdateVariants(
                        queryRunner, 
                        id, 
                        existingProduct.productVariants || [],
                        updateProductDto.variants,
                        existingProduct.name
                    );
                }

                // 3. Smart update media if provided
                if (updateProductDto.mediaItems) {
                    await this.smartUpdateMedia(
                        queryRunner,
                        id,
                        existingProduct.productMedia || [],
                        updateProductDto.mediaItems
                    );
                }

                // 4. Smart update attributes if provided
                if (updateProductDto.productAttributes !== undefined) {
                    // If empty array, delete all attributes
                    if (updateProductDto.productAttributes.length === 0) {
                        await queryRunner.manager.delete(ProductAttribute, { productId: id });
                    } else {
                        await this.smartUpdateAttributes(
                            queryRunner,
                            id,
                            existingProduct.productAttributes || [],
                            updateProductDto.productAttributes
                        );
                    }
                }

                // 5. Reload product with all relations
                const productWithRelations = await this.productRepository.findById(id);
                if (!productWithRelations) {
                    throw new Error('Không thể tải sản phẩm sau khi cập nhật');
                }

                return this.mapToResponseDto(productWithRelations);
            });
        } catch (error) {
            throw new BadRequestException('Không thể cập nhật sản phẩm: ' + error.message);
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const exists = await this.productRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
        }

        const affected = await this.productRepository.delete(id);
        if (affected === 0) {
            throw new BadRequestException('Không thể xóa sản phẩm');
        }

        return { message: 'Xóa sản phẩm thành công' };
    }

    /**
     * EXAMPLE: Update multiple products with transaction
     * Custom transaction logic for complex operations
     */
    async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<{ updated: number }> {
        return await this.productRepository.withTransaction(async (queryRunner) => {
            let updated = 0;
            
            for (const id of ids) {
                const result = await queryRunner.manager.update(
                    'products',
                    { id },
                    { isActive, updatedAt: new Date() }
                );
                updated += result.affected ?? 0;
            }

            return { updated };
        });
    }

    private mapToResponseDto(product: Product): ProductResponseDto {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            isActive: product.isActive,
            categoryId: product.categoryId,
            discountId: product.discountId,
            price: product.price,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            category: product.category ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
            } : undefined,
            discount: product.discount ? {
                id: product.discount.id,
                name: product.discount.name,
                discountValue: product.discount.discountValue,
                discountType: product.discount.discountType,
            } : undefined,
            productVariants: product.productVariants?.map(variant => ({
                id: variant.id,
                name: variant.name,
                description: variant.description,
                isActive: variant.isActive,
                productSizeId: variant.productSizeId,
                productColorId: variant.productColorId,
                price: variant.price,
                productSize: variant.productSize ? {
                    id: variant.productSize.id,
                    name: variant.productSize.name,
                    description: variant.productSize.description,
                } : undefined,
                productColor: variant.productColor ? {
                    id: variant.productColor.id,
                    name: variant.productColor.name,
                    colorCode: variant.productColor.colorCode,
                    description: variant.productColor.description,
                } : undefined,
                createdAt: variant.createdAt,
                updatedAt: variant.updatedAt,
            })),
            productMedia: product.productMedia?.map(media => ({
                id: media.id,
                mediaId: media.mediaId,
                mediaCategory: media.mediaCategory,
                media: media.media ? {
                    id: media.media.id,
                    name: media.media.name,
                    originName: media.media.originName,
                    url: media.media.url,
                    mediaType: media.media.mediaType,
                    mimeType: media.media.mimeType,
                    size: media.media.size,
                    width: media.media.width,
                    height: media.media.height,
                } : undefined,
                createdAt: media.createdAt,
                updatedAt: media.updatedAt,
            })),
            
            primaryImage: (() => {
                const primaryMedia = product.productMedia?.find(
                    pm => pm.mediaCategory === MEDIA_CATEGORY.PRIMARY && pm.media
                );
                return primaryMedia?.media ? {
                    id: primaryMedia.media.id,
                    name: primaryMedia.media.name,
                    originName: primaryMedia.media.originName,
                    url: primaryMedia.media.url,
                    mediaType: primaryMedia.media.mediaType,
                    mimeType: primaryMedia.media.mimeType,
                    size: primaryMedia.media.size,
                    width: primaryMedia.media.width,
                    height: primaryMedia.media.height,
                } : undefined;
            })(),
            secondaryImage: (() => {
                const secondaryMedia = product.productMedia?.find(
                    pm => pm.mediaCategory === MEDIA_CATEGORY.SECONDARY && pm.media
                );
                return secondaryMedia?.media ? {
                    id: secondaryMedia.media.id,
                    name: secondaryMedia.media.name,
                    originName: secondaryMedia.media.originName,
                    url: secondaryMedia.media.url,
                    mediaType: secondaryMedia.media.mediaType,
                    mimeType: secondaryMedia.media.mimeType,
                    size: secondaryMedia.media.size,
                    width: secondaryMedia.media.width,
                    height: secondaryMedia.media.height,
                } : undefined;
            })(),

            // Ensure productAttributes is included in the response
            productAttributes: product.productAttributes?.map(attr => ({
                id: attr.id,
                name: attr.name,
                value: attr.value,
                createdAt: attr.createdAt,
                updatedAt: attr.updatedAt,
            })),
        };
    }
}