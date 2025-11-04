import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSizesService } from './product-sizes.service';
import { AdminProductSizesController } from './admin-product-sizes.controller';
import { ProductSizeRepository } from './product-sizes.repository';
import { ProductSize } from '@/database/entities/product-size.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductSize]),
    ],
    controllers: [AdminProductSizesController],
    providers: [ProductSizeRepository, ProductSizesService],
    exports: [ProductSizesService, ProductSizeRepository],
})
export class ProductSizesModule {}



