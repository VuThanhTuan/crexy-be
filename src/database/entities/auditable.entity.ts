import { Column, DeleteDateColumn } from 'typeorm';

export abstract class AuditableEntity {
    @Column({ type: 'uuid', nullable: true, name: 'created_user_id' })
    createdUserId: string;

    @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'updated_user_id' })
    updatedUserId: string;

    @Column({
        type: 'timestamp',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        name: 'updated_at',
    })
    updatedAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'deleted_user_id' })
    deletedUserId: string;

    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
    deletedAt: Date;
}
