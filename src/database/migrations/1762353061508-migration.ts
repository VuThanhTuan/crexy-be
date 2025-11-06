import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762353061508 implements MigrationInterface {
    name = 'Migration1762353061508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_product_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "price" numeric(18,0) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "products" ADD "price" numeric(18,0) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
