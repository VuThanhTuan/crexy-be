import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductColorsService } from './product-colors.service';
import { AdminProductColorsController } from './admin-product-colors.controller';
import { ProductColorRepository } from './product-colors.repository';
import { ProductColor } from '@/database/entities/product-color.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductColor]),
    ],
    controllers: [AdminProductColorsController],
    providers: [ProductColorRepository, ProductColorsService],
    exports: [ProductColorsService, ProductColorRepository],
})
export class ProductColorsModule {}

