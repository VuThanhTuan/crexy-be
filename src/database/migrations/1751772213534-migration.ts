import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1751772213534 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert admin user
        // password: tuanvu123
        // SYSTEM_USER_ID: 00000000-0000-0000-0000-000000000000
        await queryRunner.query(
            `INSERT INTO users (is_staff, is_super_admin, user_name, created_user_id, created_at, password, id)
            VALUES( true, true, 'admin', '00000000-0000-0000-0000-000000000000', now(), '$2a$12$PeJh2cqaaLaL3.4zDrwr7u2xNOhMKVZ/yvo6.nWhqHFqryZcsS3su', gen_random_uuid());`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}

