import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { ProductCollection } from './product-collection.entity';
import { Media } from './media.entity';

@Entity('collections')
export class Collection extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true, name: 'slug' })
    slug: string;

    @Column({ type: 'uuid', nullable: true, name: 'media_id' })
    mediaId: string;

    @ManyToOne(() => Media, (media) => media.collections, { nullable: true })
    @JoinColumn({ name: 'media_id' })
    media: Media;

    @OneToMany(() => ProductCollection, (productCollection) => productCollection.collection)
    productCollections: ProductCollection[];
}
