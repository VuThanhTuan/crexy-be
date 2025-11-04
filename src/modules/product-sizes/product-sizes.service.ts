import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductSize } from '@/database/entities/product-size.entity';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { ProductSizeQueryDto } from './dto/product-size-query.dto';
import { ProductSizeResponseDto, PaginatedProductSizeResponseDto } from './dto/product-size-response.dto';
import { ProductSizeRepository } from './product-sizes.repository';

@Injectable()
export class ProductSizesService {
    constructor(
        private readonly productSizeRepository: ProductSizeRepository,
    ) {}

    async create(createProductSizeDto: CreateProductSizeDto): Promise<ProductSizeResponseDto> {
        // Check if size name already exists
        const existingSize = await this.productSizeRepository.findByName(
            createProductSizeDto.name
        );

        if (existingSize) {
            throw new ConflictException(
                `Kích thước "${createProductSizeDto.name}" đã tồn tại`
            );
        }

        try {
            const savedSize = await this.productSizeRepository.create(createProductSizeDto);
            return this.mapToResponseDto(savedSize);
        } catch (error) {
            throw new BadRequestException('Không thể tạo kích thước: ' + error.message);
        }
    }

    async findAll(query: ProductSizeQueryDto): Promise<PaginatedProductSizeResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [sizes, total] = await this.productSizeRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: sizes.map(size => this.mapToResponseDto(size)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<ProductSizeResponseDto> {
        const size = await this.productSizeRepository.findById(id);

        if (!size) {
            throw new NotFoundException(`Không tìm thấy kích thước với ID: ${id}`);
        }
        return this.mapToResponseDto(size);
    }

    async update(id: string, updateProductSizeDto: UpdateProductSizeDto): Promise<ProductSizeResponseDto> {
        const exists = await this.productSizeRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy kích thước với ID: ${id}`);
        }

        // If updating name, check if new name already exists
        if (updateProductSizeDto.name) {
            const existingSize = await this.productSizeRepository.findByName(
                updateProductSizeDto.name
            );

            if (existingSize && existingSize.id !== id) {
                throw new ConflictException(
                    `Kích thước "${updateProductSizeDto.name}" đã tồn tại`
                );
            }
        }

        try {
            const updatedSize = await this.productSizeRepository.update(id, updateProductSizeDto);
            if (!updatedSize) {
                throw new NotFoundException(`Không tìm thấy kích thước với ID: ${id}`);
            }
            return this.mapToResponseDto(updatedSize);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật kích thước: ' + error.message);
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const exists = await this.productSizeRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy kích thước với ID: ${id}`);
        }

        try {
            const affected = await this.productSizeRepository.delete(id);
            if (affected === 0) {
                throw new BadRequestException('Không thể xóa kích thước');
            }

            return { message: 'Xóa kích thước thành công' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể xóa kích thước: ' + error.message);
        }
    }

    private mapToResponseDto(size: ProductSize): ProductSizeResponseDto {
        return {
            id: size.id,
            name: size.name,
            description: size.description,
            createdAt: size.createdAt,
            updatedAt: size.updatedAt,
        };
    }
}



