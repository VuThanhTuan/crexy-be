import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { MediaCategory } from '../../common/types/types';
import { Product } from './product.entity';
import { Media } from './media.entity';

@Entity('product_media')
export class ProductMedia extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'media_id' })
    mediaId: string;

    @Column({ type: 'varchar', length: 50, name: 'media_category' })
    mediaCategory: MediaCategory;

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @ManyToOne(() => Media, (media) => media.productMedia)
    @JoinColumn({ name: 'media_id' })
    media: Media;

    @ManyToOne(() => Product, (product) => product.productMedia)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
