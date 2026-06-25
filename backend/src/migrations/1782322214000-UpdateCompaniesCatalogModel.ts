import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompaniesCatalogModel1782322214000 implements MigrationInterface {
  name = 'UpdateCompaniesCatalogModel1782322214000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "normalized_name" character varying(255)`,
    );

    await queryRunner.query(
      `UPDATE "companies" SET "normalized_name" = regexp_replace(lower(trim("name")), '[[:space:]]+', ' ', 'g') WHERE "normalized_name" IS NULL`,
    );

    await queryRunner.query(`
      DO $$
      DECLARE
        invalid_companies text;
      BEGIN
        SELECT string_agg("company_id"::text || ':' || coalesce("name", '<NULL>'), ', ')
        INTO invalid_companies
        FROM "companies"
        WHERE "normalized_name" IS NULL OR "normalized_name" = '';

        IF invalid_companies IS NOT NULL THEN
          RAISE EXCEPTION 'Cannot make companies.normalized_name mandatory. Invalid companies: %', invalid_companies;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        duplicate_names text;
      BEGIN
        SELECT string_agg("normalized_name" || ' (' || duplicate_count || ')', ', ')
        INTO duplicate_names
        FROM (
          SELECT "normalized_name", COUNT(*) AS duplicate_count
          FROM "companies"
          GROUP BY "normalized_name"
          HAVING COUNT(*) > 1
        ) duplicates;

        IF duplicate_names IS NOT NULL THEN
          RAISE EXCEPTION 'Cannot add unique constraint on companies.normalized_name. Duplicate normalized names: %', duplicate_names;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "normalized_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_companies_normalized_name" UNIQUE ("normalized_name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "is_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "created_by_user_id" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_created_by_user_id" ON "companies" ("created_by_user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_companies_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_companies_created_by_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_companies_created_by_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "created_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "is_verified"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_companies_normalized_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "normalized_name"`,
    );
  }
}
