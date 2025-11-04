import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Product } from './product.entity';
@Entity('categories')
export class Category extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', nullable: true, name: 'slug' })
    slug: string;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description: string;

    @Column({ type: 'varchar', nullable: true, name: 'background_image' })
    backgroundImage: string;

    @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
    parentId: string;

    @ManyToOne(() => Category, (category) => category.childrens, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, (category) => category.parent, { nullable: true })
    childrens: Category[];

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
