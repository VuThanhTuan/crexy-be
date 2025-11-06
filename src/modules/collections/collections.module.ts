import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { AdminCollectionsController } from './admin-collections.controller';
import { CollectionRepository } from './collections.repository';
import { Collection } from '@/database/entities/colection.entity';
import { ProductCollection } from '@/database/entities/product-collection.entity';
import { Product } from '@/database/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Collection,
            ProductCollection,
            Product,
        ]),
    ],
    controllers: [AdminCollectionsController],
    providers: [CollectionRepository, CollectionsService],
    exports: [CollectionsService, CollectionRepository],
})
export class CollectionsModule {}
