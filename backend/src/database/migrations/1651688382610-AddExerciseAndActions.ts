import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExerciseAndActions1651688382610 implements MigrationInterface {
    name = 'AddExerciseAndActions1651688382610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exercise_wrapper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tickCounter" integer NOT NULL DEFAULT '0', "initialStateString" json NOT NULL, "participantId" character(6) NOT NULL, "trainerId" character(8) NOT NULL, CONSTRAINT "PK_6c3a93f30556ce6242dfe1cefed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_emitter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emitterId" character varying(36) NOT NULL, "emitterName" character varying(255), "exerciseId" uuid NOT NULL, CONSTRAINT "UQ_b4c749cf01f7433d57e9c896d6f" UNIQUE ("emitterId"), CONSTRAINT "PK_184934fb277f88f0dc5f797db0f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_wrapper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "actionString" json NOT NULL, "emitterId" uuid NOT NULL, CONSTRAINT "PK_ac96ea96dc46bb762faab07a0d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_emitter" ADD CONSTRAINT "FK_8cc49db58667c1b407981516bb8" FOREIGN KEY ("exerciseId") REFERENCES "exercise_wrapper"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_wrapper" ADD CONSTRAINT "FK_b39e30eb5742df0f2050fb0689d" FOREIGN KEY ("emitterId") REFERENCES "action_emitter"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_wrapper" DROP CONSTRAINT "FK_b39e30eb5742df0f2050fb0689d"`);
        await queryRunner.query(`ALTER TABLE "action_emitter" DROP CONSTRAINT "FK_8cc49db58667c1b407981516bb8"`);
        await queryRunner.query(`DROP TABLE "action_wrapper"`);
        await queryRunner.query(`DROP TABLE "action_emitter"`);
        await queryRunner.query(`DROP TABLE "exercise_wrapper"`);
    }

}
