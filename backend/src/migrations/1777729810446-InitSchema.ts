import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1777729810446 implements MigrationInterface {
  name = 'InitSchema1777729810446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("company_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "website" character varying(255), CONSTRAINT "PK_8c008cd5c4c0c20cf1e77f68e8d" PRIMARY KEY ("company_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("contract_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_d4c091e72433a7125d9158170e7" PRIMARY KEY ("contract_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "statuses" ("status_id" SERIAL NOT NULL, "display_order" integer NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_2b37f0d7dd1a575a9c05aa06154" UNIQUE ("display_order"), CONSTRAINT "UQ_037e43ea842b18ce4e5f4dcfd06" UNIQUE ("name"), CONSTRAINT "PK_e60daf67031169e5ef3fa35e133" PRIMARY KEY ("status_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("document_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "document_type" character varying(255) NOT NULL, "file_path" text NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_bec3c89789f76e330bbe1766b2c" PRIMARY KEY ("document_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "applications" ("application_id" SERIAL NOT NULL, "job_title" character varying(255) NOT NULL, "job_domain" character varying(255), "location" character varying(255), "project_goal" text, "job_description" text, "job_url" text, "score" integer NOT NULL DEFAULT '0', "user_id" integer NOT NULL, "company_id" integer NOT NULL, "contract_id" integer NOT NULL, "status_id" integer NOT NULL, CONSTRAINT "PK_418038704e50c663590feb7f511" PRIMARY KEY ("application_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_templates" ("email_template_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "subject" character varying(255) NOT NULL, "body" text NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_de49a45f63cce54faa82e624c30" PRIMARY KEY ("email_template_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("tag_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_06a35221325edeb80ad2ec1ff85" PRIMARY KEY ("tag_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("event_id" SERIAL NOT NULL, "event_type" character varying(255) NOT NULL, "occurred_at" TIMESTAMP NOT NULL DEFAULT now(), "application_id" integer NOT NULL, CONSTRAINT "PK_1b77463a4487f09e798dffcb43a" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("contact_id" SERIAL NOT NULL, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "role" character varying(255), "notes" text, "company_id" integer NOT NULL, CONSTRAINT "PK_b85c417d6af2e06ff6ba8c8234d" PRIMARY KEY ("contact_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("comment_id" SERIAL NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "event_id" integer NOT NULL, CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY ("comment_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_tag" ("document_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_78e74c1614f5e1ca28d1c9d4243" PRIMARY KEY ("document_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76f7f006aaff1fc3b5850aee6f" ON "document_tag" ("document_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_175832eb0d915e76527a23819d" ON "document_tag" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "application_tag" ("application_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_ada261723bf08d9dc9e54039a72" PRIMARY KEY ("application_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ea2b7b45e4e88a447a55d5e80" ON "application_tag" ("application_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ab8aecc0c76aede008b612796" ON "application_tag" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "application_document" ("application_id" integer NOT NULL, "document_id" integer NOT NULL, CONSTRAINT "PK_db75e714183c8f3a5741383478d" PRIMARY KEY ("application_id", "document_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49f4aa9cdf8d6ae270c557db9f" ON "application_document" ("application_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f531f381939b20368f386598a" ON "application_document" ("document_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "email_template_tag" ("email_template_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_e90920a26d3a546601d1568be3b" PRIMARY KEY ("email_template_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_829659ab67a5b4d629e817af6b" ON "email_template_tag" ("email_template_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c9fac5407ab59e1c84fecdaa9" ON "email_template_tag" ("tag_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_c7481daf5059307842edef74d73" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_9e7594d5b474d9cbebba15c1ae7" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_cb7a3b4b25f960e895d3213a010" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_9416ab1e1faecfcdf7703a6b6fb" FOREIGN KEY ("contract_id") REFERENCES "contracts"("contract_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_5b1e0e1dd2282503e02bf678665" FOREIGN KEY ("status_id") REFERENCES "statuses"("status_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_templates" ADD CONSTRAINT "FK_513421601bd786a33c5a7238f45" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_d682e6004909b59ceec39aa3d34" FOREIGN KEY ("application_id") REFERENCES "applications"("application_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_b53945f3dfe982678bfeb5e1b4f" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_acb7ccd75fdad8ca158e1360a13" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_tag" ADD CONSTRAINT "FK_76f7f006aaff1fc3b5850aee6ff" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_tag" ADD CONSTRAINT "FK_175832eb0d915e76527a23819d7" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_tag" ADD CONSTRAINT "FK_5ea2b7b45e4e88a447a55d5e807" FOREIGN KEY ("application_id") REFERENCES "applications"("application_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_tag" ADD CONSTRAINT "FK_6ab8aecc0c76aede008b6127965" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_49f4aa9cdf8d6ae270c557db9f2" FOREIGN KEY ("application_id") REFERENCES "applications"("application_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_2f531f381939b20368f386598a7" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_template_tag" ADD CONSTRAINT "FK_829659ab67a5b4d629e817af6b3" FOREIGN KEY ("email_template_id") REFERENCES "email_templates"("email_template_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_template_tag" ADD CONSTRAINT "FK_5c9fac5407ab59e1c84fecdaa99" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_template_tag" DROP CONSTRAINT "FK_5c9fac5407ab59e1c84fecdaa99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_template_tag" DROP CONSTRAINT "FK_829659ab67a5b4d629e817af6b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_2f531f381939b20368f386598a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_49f4aa9cdf8d6ae270c557db9f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_tag" DROP CONSTRAINT "FK_6ab8aecc0c76aede008b6127965"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_tag" DROP CONSTRAINT "FK_5ea2b7b45e4e88a447a55d5e807"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_tag" DROP CONSTRAINT "FK_175832eb0d915e76527a23819d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_tag" DROP CONSTRAINT "FK_76f7f006aaff1fc3b5850aee6ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_acb7ccd75fdad8ca158e1360a13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_b53945f3dfe982678bfeb5e1b4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_d682e6004909b59ceec39aa3d34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_templates" DROP CONSTRAINT "FK_513421601bd786a33c5a7238f45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_5b1e0e1dd2282503e02bf678665"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_9416ab1e1faecfcdf7703a6b6fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_cb7a3b4b25f960e895d3213a010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_9e7594d5b474d9cbebba15c1ae7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_c7481daf5059307842edef74d73"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c9fac5407ab59e1c84fecdaa9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_829659ab67a5b4d629e817af6b"`,
    );
    await queryRunner.query(`DROP TABLE "email_template_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f531f381939b20368f386598a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49f4aa9cdf8d6ae270c557db9f"`,
    );
    await queryRunner.query(`DROP TABLE "application_document"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ab8aecc0c76aede008b612796"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ea2b7b45e4e88a447a55d5e80"`,
    );
    await queryRunner.query(`DROP TABLE "application_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_175832eb0d915e76527a23819d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76f7f006aaff1fc3b5850aee6f"`,
    );
    await queryRunner.query(`DROP TABLE "document_tag"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "email_templates"`);
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "statuses"`);
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
