import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1761969995414 implements MigrationInterface {
    name = 'Migration1761969995414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collections" RENAME COLUMN "background_image" TO "media_id"`);
        await queryRunner.query(`CREATE TABLE "media" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "origin_name" character varying(255) NOT NULL, "media_type" character varying(50) NOT NULL, "mime_type" character varying(100) NOT NULL, "url" character varying NOT NULL, "size" bigint, "width" integer, "height" integer, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP COLUMN "media_url"`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP COLUMN "media_type"`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD "media_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "media_id"`);
        await queryRunner.query(`ALTER TABLE "collections" ADD "media_id" uuid`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_ad70341ae5cddf506a57f06261d" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_ad70341ae5cddf506a57f06261d"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "media_id"`);
        await queryRunner.query(`ALTER TABLE "collections" ADD "media_id" character varying`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP COLUMN "media_id"`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD "media_type" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD "media_url" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`ALTER TABLE "collections" RENAME COLUMN "media_id" TO "background_image"`);
    }

}
