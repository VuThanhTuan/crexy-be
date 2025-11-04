import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { ProductVariant } from './product-variant.entity';
@Entity('product_colors')
export class ProductColor extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', length: 7, name: 'color_code' })
    colorCode: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @OneToMany(() => ProductVariant, (productVariant) => productVariant.productColor)
    productVariants: ProductVariant[];
}
