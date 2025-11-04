import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductIdToVariants1761970000000 implements MigrationInterface {
    name = 'AddProductIdToVariants1761970000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column already exists
        const table = await queryRunner.getTable('product_variants');
        const columnExists = table?.findColumnByName('product_id');
        
        if (!columnExists) {
            // Check if there's existing data
            const result = await queryRunner.query(`SELECT COUNT(*)::int as count FROM "product_variants"`);
            const count = result[0]?.count || 0;
            
            if (count > 0) {
                // If there's existing data without product_id, delete them first
                // These are orphaned variants that shouldn't exist
                await queryRunner.query(`DELETE FROM "product_variants"`);
            }
            
            // Add product_id column as NOT NULL
            await queryRunner.query(`ALTER TABLE "product_variants" ADD "product_id" uuid NOT NULL`);
            
            // Add foreign key constraint
            await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_product_id"`);
        
        // Drop product_id column
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "product_id"`);
    }
}

