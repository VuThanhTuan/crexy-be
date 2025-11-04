import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductColor } from '@/database/entities/product-color.entity';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { ProductColorQueryDto } from './dto/product-color-query.dto';
import { ProductColorResponseDto, PaginatedProductColorResponseDto } from './dto/product-color-response.dto';
import { ProductColorRepository } from './product-colors.repository';

@Injectable()
export class ProductColorsService {
    constructor(
        private readonly productColorRepository: ProductColorRepository,
    ) {}

    async create(createProductColorDto: CreateProductColorDto): Promise<ProductColorResponseDto> {
        // Check if color code already exists
        const existingColor = await this.productColorRepository.findByColorCode(
            createProductColorDto.colorCode
        );

        if (existingColor) {
            throw new ConflictException(
                `Mã màu ${createProductColorDto.colorCode} đã tồn tại`
            );
        }

        try {
            const savedColor = await this.productColorRepository.create(createProductColorDto);
            return this.mapToResponseDto(savedColor);
        } catch (error) {
            throw new BadRequestException('Không thể tạo màu sắc: ' + error.message);
        }
    }

    async findAll(query: ProductColorQueryDto): Promise<PaginatedProductColorResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [colors, total] = await this.productColorRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: colors.map(color => this.mapToResponseDto(color)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<ProductColorResponseDto> {
        const color = await this.productColorRepository.findById(id);

        if (!color) {
            throw new NotFoundException(`Không tìm thấy màu sắc với ID: ${id}`);
        }
        return this.mapToResponseDto(color);
    }

    async update(id: string, updateProductColorDto: UpdateProductColorDto): Promise<ProductColorResponseDto> {
        const exists = await this.productColorRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy màu sắc với ID: ${id}`);
        }

        // If updating color code, check if new code already exists
        if (updateProductColorDto.colorCode) {
            const existingColor = await this.productColorRepository.findByColorCode(
                updateProductColorDto.colorCode
            );

            if (existingColor && existingColor.id !== id) {
                throw new ConflictException(
                    `Mã màu ${updateProductColorDto.colorCode} đã tồn tại`
                );
            }
        }

        try {
            const updatedColor = await this.productColorRepository.update(id, updateProductColorDto);
            if (!updatedColor) {
                throw new NotFoundException(`Không tìm thấy màu sắc với ID: ${id}`);
            }
            return this.mapToResponseDto(updatedColor);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật màu sắc: ' + error.message);
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const exists = await this.productColorRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy màu sắc với ID: ${id}`);
        }

        try {
            const affected = await this.productColorRepository.delete(id);
            if (affected === 0) {
                throw new BadRequestException('Không thể xóa màu sắc');
            }

            return { message: 'Xóa màu sắc thành công' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể xóa màu sắc: ' + error.message);
        }
    }

    private mapToResponseDto(color: ProductColor): ProductColorResponseDto {
        return {
            id: color.id,
            name: color.name,
            colorCode: color.colorCode,
            description: color.description,
            createdAt: color.createdAt,
            updatedAt: color.updatedAt,
        };
    }
}

