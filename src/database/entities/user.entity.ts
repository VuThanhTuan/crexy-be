import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';
@Entity('users')
export class User extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true, name: 'identity_id' })
    identityId: string;

    @Column({ type: 'varchar', length: 50, default: 'local', name: 'provider' })
    provider: string;

    @Column({ type: 'varchar', length: 255, unique: true, name: 'email' })
    email: string;

    @Column({ type: 'varchar', length: 255, name: 'fullname' })
    fullname: string;

    @Column({ type: 'varchar', length: 500, nullable: true, name: 'password' })
    password: string;

    @Column({ type: 'boolean', default: false, name: 'is_staff' })
    isStaff: boolean;

    @Column({ type: 'boolean', default: false, name: 'is_super_admin' })
    isSuperAdmin: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'phone_number' })
    phoneNumber: string;

    @Column({ type: 'text', nullable: true, name: 'address' })
    address: string;

    @Column({ type: 'text', nullable: true, name: 'avatar' })
    avatar: string;

    @Column({ type: 'boolean', default: false, name: 'email_verified' })
    emailVerified: boolean;
}
