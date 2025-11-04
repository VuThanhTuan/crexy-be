import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductIdToVariants1761970000000 implements MigrationInterface {
    name = 'AddProductIdToVariants1761970000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column already exists
        const table = await queryRunner.getTable('product_variants');
        const columnExists = table?.findColumnByName('product_id');
        
        if (!columnExists) {
            // First, add column as nullable (in case there's existing data)
            await queryRunner.query(`ALTER TABLE "product_variants" ADD "product_id" uuid`);
            
            // If there are existing variants without products, we can't set NOT NULL
            // So we'll make it nullable in the entity but required in application logic
            // For now, let's set it to NOT NULL after ensuring all existing rows have product_id
            const hasData = await queryRunner.query(`SELECT COUNT(*) as count FROM "product_variants"`);
            if (hasData[0]?.count === '0') {
                // No existing data, safe to set NOT NULL
                await queryRunner.query(`ALTER TABLE "product_variants" ALTER COLUMN "product_id" SET NOT NULL`);
            }
            
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

