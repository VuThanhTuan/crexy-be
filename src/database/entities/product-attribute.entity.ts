import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Product } from './product.entity';

@Entity('product_attributes')
export class ProductAttribute extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', name: 'value' })
    value: string;

    @Column({ type: 'uuid', nullable: true, name: 'product_id' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.productAttributes)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
