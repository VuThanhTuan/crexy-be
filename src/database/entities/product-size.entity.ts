import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { ProductVariant } from './product-variant.entity';
@Entity('product_sizes')
export class ProductSize extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @OneToMany(() => ProductVariant, (productVariant) => productVariant.productSize)
    productVariants: ProductVariant[];
}
