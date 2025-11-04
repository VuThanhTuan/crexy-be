import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751772197748 implements MigrationInterface {
    name = 'Migration1751772197748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identity_id" character varying, "user_name" character varying(255) NOT NULL, "password" character varying(500) NOT NULL, "is_staff" boolean NOT NULL DEFAULT false, "is_super_admin" boolean NOT NULL DEFAULT false, "phone_number" character varying(50), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying, "description" text, "background_image" character varying, "parent_id" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_media" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "media_url" character varying NOT NULL, "media_type" character varying(50) NOT NULL, "media_category" character varying(50) NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_09d4639de8082a32aa27f3ac9a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "collections" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "slug" character varying(500), "background_image" character varying, CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_collections" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collection_id" uuid NOT NULL, "product_id" uuid NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_32bc9e0d29551e755a4df9a5f4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_attributes" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying NOT NULL, "product_id" uuid, CONSTRAINT "PK_4fa18fc5c893cb9894fc40ca921" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discounts" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying NOT NULL, "discount_type" character varying NOT NULL DEFAULT 'percentage', "discount_value" double precision NOT NULL, CONSTRAINT "PK_66c522004212dc814d6e2f14ecc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "category_id" uuid NOT NULL, "discount_id" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_sizes" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, CONSTRAINT "PK_19c3d021f81c5b1ff367bad6164" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "product_size_id" uuid, "product_color_id" uuid, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_colors" ("created_user_id" uuid, "created_at" TIMESTAMP DEFAULT now(), "updated_user_id" uuid, "updated_at" TIMESTAMP DEFAULT now(), "deleted_user_id" uuid, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "color_code" character varying(7) NOT NULL, "description" text, CONSTRAINT "PK_9751ccb35a2b98e8b48e4baa4fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_collections" ADD CONSTRAINT "FK_2f6ff219d1b76f164f46f514fcd" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_collections" ADD CONSTRAINT "FK_c876fae7420b26100e0767e7ad1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1b3cc8583760313fe1ec86baaa1" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_9de70e1f80acfdd60362666f3d0" FOREIGN KEY ("product_size_id") REFERENCES "product_sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_21f190450a0bd1a64f9dbc29f51" FOREIGN KEY ("product_color_id") REFERENCES "product_colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_21f190450a0bd1a64f9dbc29f51"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_9de70e1f80acfdd60362666f3d0"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1b3cc8583760313fe1ec86baaa1"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd"`);
        await queryRunner.query(`ALTER TABLE "product_collections" DROP CONSTRAINT "FK_c876fae7420b26100e0767e7ad1"`);
        await queryRunner.query(`ALTER TABLE "product_collections" DROP CONSTRAINT "FK_2f6ff219d1b76f164f46f514fcd"`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151"`);
        await queryRunner.query(`DROP TABLE "product_colors"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TABLE "product_sizes"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "discounts"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
        await queryRunner.query(`DROP TABLE "product_collections"`);
        await queryRunner.query(`DROP TABLE "collections"`);
        await queryRunner.query(`DROP TABLE "product_media"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
