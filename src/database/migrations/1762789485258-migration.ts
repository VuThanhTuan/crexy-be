import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762789485258 implements MigrationInterface {
    name = 'Migration1762789485258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying(50) NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
    }

}
