import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Collection } from './colection.entity';
import { Product } from './product.entity';
@Entity('product_collections')
export class ProductCollection extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'collection_id' })
    collectionId: string;

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @Column({ type: 'int', default: 0, name: 'order' })
    order: number;

    @ManyToOne(() => Collection, (collection) => collection.productCollections)
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    @ManyToOne(() => Product, (product) => product.productCollections)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
