import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762442172793 implements MigrationInterface {
    name = 'Migration1762442172793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "fullname" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullname"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_name" character varying(255) NOT NULL`);
    }

}
