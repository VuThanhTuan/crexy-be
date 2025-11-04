import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
import { Product } from './product.entity';
import { DiscountType } from '../../common/types/types';
import { DISCOUNT_TYPE } from '../../common/consts/app';
@Entity('discounts')
export class Discount extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', name: 'value' })
    value: string;

    @Column({ type: 'varchar', default: DISCOUNT_TYPE.PERCENTAGE, name: 'discount_type' })
    discountType: DiscountType;

    @Column({ type: 'float', name: 'discount_value' })
    discountValue: number;

    @OneToMany(() => Product, (product) => product.discount)
    products: Product[];
}
