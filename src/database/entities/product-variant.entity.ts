import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Product } from './product.entity';
import { ProductSize } from './product-size.entity';
import { ProductColor } from './product-color.entity';
@Entity('product_variants')
export class ProductVariant extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @Column({ type: 'uuid', nullable: true, name: 'product_size_id' })
    productSizeId: string;

    @Column({ type: 'uuid', nullable: true, name: 'product_color_id' })
    productColorId: string;

    @Column({ type: 'decimal', precision: 18, scale: 0, nullable: false, default: 0, name: 'price' })
    price: number;

    @ManyToOne(() => Product, (product) => product.productVariants)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductSize, (productSize) => productSize.productVariants)
    @JoinColumn({ name: 'product_size_id' })
    productSize: ProductSize;

    @ManyToOne(() => ProductColor, (productColor) => productColor.productVariants)
    @JoinColumn({ name: 'product_color_id' })
    productColor: ProductColor;
}
