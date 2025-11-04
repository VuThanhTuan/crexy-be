import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { MediaType } from '../../common/types/types';
import { ProductMedia } from './product-media.entity';
import { Collection } from './colection.entity';

@Entity('media')
export class Media extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', length: 255, name: 'origin_name' })
    originName: string;

    @Column({ type: 'varchar', length: 50, name: 'media_type' })
    mediaType: MediaType;

    @Column({ type: 'varchar', length: 100, name: 'mime_type' })
    mimeType: string;

    @Column({ type: 'varchar', name: 'url' })
    url: string;

    @Column({ type: 'bigint', nullable: true, name: 'size' })
    size: number;

    @Column({ type: 'int', nullable: true, name: 'width' })
    width: number;

    @Column({ type: 'int', nullable: true, name: 'height' })
    height: number;

    @OneToMany(() => ProductMedia, (productMedia) => productMedia.media)
    productMedia: ProductMedia[];

    @OneToMany(() => Collection, (collection) => collection.media)
    collections: Collection[];
}

