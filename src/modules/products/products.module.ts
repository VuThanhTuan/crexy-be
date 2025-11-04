import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductRepository } from './products.repository';
import { Product } from '@/database/entities/product.entity';
import { ProductVariant } from '@/database/entities/product-variant.entity';
import { ProductMedia } from '@/database/entities/product-media.entity';
import { ProductSize } from '@/database/entities/product-size.entity';
import { ProductColor } from '@/database/entities/product-color.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product, 
            ProductVariant, 
            ProductMedia, 
            ProductSize, 
            ProductColor
        ]),
    ],
    controllers: [ProductsController, AdminProductsController],
    providers: [ProductRepository, ProductsService],
    exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
