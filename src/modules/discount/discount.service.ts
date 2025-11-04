import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Discount } from '@/database/entities/discount.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountQueryDto } from './dto/discount-query.dto';
import { DiscountResponseDto, PaginatedDiscountResponseDto } from './dto/discount-response.dto';
import { DiscountRepository } from './discount.repository';
import { DISCOUNT_TYPE } from '@/common/consts/app';

@Injectable()
export class DiscountService {
    constructor(
        private readonly discountRepository: DiscountRepository,
    ) {}

    async create(createDiscountDto: CreateDiscountDto): Promise<DiscountResponseDto> {
        // Validate discountValue based on discountType
        if (createDiscountDto.discountType === DISCOUNT_TYPE.PERCENTAGE) {
            if (createDiscountDto.discountValue < 0 || createDiscountDto.discountValue > 100) {
                throw new BadRequestException(
                    'Giá trị giảm giá theo phần trăm phải từ 0 đến 100'
                );
            }
        } else if (createDiscountDto.discountType === DISCOUNT_TYPE.FIXED) {
            if (createDiscountDto.discountValue < 0) {
                throw new BadRequestException(
                    'Giá trị giảm giá cố định phải lớn hơn hoặc bằng 0'
                );
            }
        }

        // Validate discountValue is integer (handled by DTO validation, but double-check here)
        if (!Number.isInteger(createDiscountDto.discountValue)) {
            throw new BadRequestException(
                'Giá trị giảm giá phải là số nguyên'
            );
        }

        try {
            const savedDiscount = await this.discountRepository.create(createDiscountDto);
            return await this.mapToResponseDto(savedDiscount);
        } catch (error) {
            throw new BadRequestException('Không thể tạo mã giảm giá: ' + error.message);
        }
    }

    async findAll(query: DiscountQueryDto): Promise<PaginatedDiscountResponseDto> {
        const { page = 1, limit = 10 } = query;
        
        const [discounts, total] = await this.discountRepository.findWithFilters(query);
        
        const totalPages = Math.ceil(total / limit);
        
        const data = await Promise.all(
            discounts.map(discount => this.mapToResponseDto(discount))
        );
        
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<DiscountResponseDto> {
        const discount = await this.discountRepository.findByIdWithRelations(id);

        if (!discount) {
            throw new NotFoundException(`Không tìm thấy mã giảm giá với ID: ${id}`);
        }
        
        return await this.mapToResponseDto(discount);
    }

    async update(id: string, updateDiscountDto: UpdateDiscountDto): Promise<DiscountResponseDto> {
        const exists = await this.discountRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy mã giảm giá với ID: ${id}`);
        }

        // If discountType or discountValue is being updated, validate
        if (updateDiscountDto.discountType !== undefined || updateDiscountDto.discountValue !== undefined) {
            // Get current discount to determine which fields need validation
            const currentDiscount = await this.discountRepository.findById(id);
            if (!currentDiscount) {
                throw new NotFoundException(`Không tìm thấy mã giảm giá với ID: ${id}`);
            }

            const discountType = updateDiscountDto.discountType ?? currentDiscount.discountType;
            const discountValue = updateDiscountDto.discountValue ?? currentDiscount.discountValue;

            // Validate discountValue based on discountType
            if (discountType === DISCOUNT_TYPE.PERCENTAGE) {
                if (discountValue < 0 || discountValue > 100) {
                    throw new BadRequestException(
                        'Giá trị giảm giá theo phần trăm phải từ 0 đến 100'
                    );
                }
            } else if (discountType === DISCOUNT_TYPE.FIXED) {
                if (discountValue < 0) {
                    throw new BadRequestException(
                        'Giá trị giảm giá cố định phải lớn hơn hoặc bằng 0'
                    );
                }
            }

            // Validate discountValue is integer
            if (!Number.isInteger(discountValue)) {
                throw new BadRequestException(
                    'Giá trị giảm giá phải là số nguyên'
                );
            }
        }

        try {
            const updatedDiscount = await this.discountRepository.update(id, updateDiscountDto);
            if (!updatedDiscount) {
                throw new NotFoundException(`Không tìm thấy mã giảm giá với ID: ${id}`);
            }
            return await this.mapToResponseDto(updatedDiscount);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể cập nhật mã giảm giá: ' + error.message);
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const exists = await this.discountRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Không tìm thấy mã giảm giá với ID: ${id}`);
        }

        // Check if discount is being used by any products
        const isUsed = await this.discountRepository.isUsedByProducts(id);
        if (isUsed) {
            throw new BadRequestException(
                'Không thể xóa mã giảm giá này vì đang được sử dụng bởi một hoặc nhiều sản phẩm. Vui lòng gỡ mã giảm giá khỏi các sản phẩm trước.'
            );
        }

        try {
            const affected = await this.discountRepository.delete(id);
            if (affected === 0) {
                throw new BadRequestException('Không thể xóa mã giảm giá');
            }

            return { message: 'Xóa mã giảm giá thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể xóa mã giảm giá: ' + error.message);
        }
    }

    private async mapToResponseDto(discount: Discount): Promise<DiscountResponseDto> {
        const productCount = await this.discountRepository.countProducts(discount.id);

        return {
            id: discount.id,
            name: discount.name,
            value: discount.value,
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            createdAt: discount.createdAt,
            updatedAt: discount.updatedAt,
            productCount,
        };
    }
}

