import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Category } from './category.entity';
import { ProductMedia } from './product-media.entity';
import { ProductCollection } from './product-collection.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductVariant } from './product-variant.entity';
import { Discount } from './discount.entity';
@Entity('products')
export class Product extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'uuid', name: 'category_id' })
    categoryId: string;

    @Column({ type: 'uuid', nullable: true, name: 'discount_id' })
    discountId: string;

    @Column({ type: 'decimal', precision: 18, scale: 0, nullable: false, default: 0, name: 'price' })
    price: number;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => ProductMedia, (productMedia) => productMedia.product)
    productMedia: ProductMedia[];

    @OneToMany(() => ProductCollection, (productCollection) => productCollection.collection)
    productCollections: ProductCollection[];

    @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product)
    productAttributes: ProductAttribute[];

    @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
    productVariants: ProductVariant[];

    @ManyToOne(() => Discount, (discount) => discount.products, { nullable: true })
    @JoinColumn({ name: 'discount_id' })
    discount: Discount;
}
