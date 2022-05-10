import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExerciseAndActions1652268120769 implements MigrationInterface {
    name = 'AddExerciseAndActions1652268120769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exercise_wrapper_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tickCounter" integer NOT NULL DEFAULT '0', "initialStateString" json NOT NULL, "participantId" character(6) NOT NULL, "trainerId" character(8) NOT NULL, CONSTRAINT "PK_9984051806086844283a599d805" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_emitter_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emitterId" uuid NOT NULL, "emitterName" character varying(255), "exerciseId" uuid NOT NULL, CONSTRAINT "UQ_ebb0def98e5d340bdd736cbb430" UNIQUE ("emitterId"), CONSTRAINT "PK_469af3686a46e1e2697c9996777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_wrapper_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "actionString" json NOT NULL, "emitterId" uuid NOT NULL, CONSTRAINT "PK_d2a88101a67c9fc3be6590969d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_emitter_entity" ADD CONSTRAINT "FK_904a09c9d5bd5cf3ddfc138bdf0" FOREIGN KEY ("exerciseId") REFERENCES "exercise_wrapper_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_wrapper_entity" ADD CONSTRAINT "FK_5fbed4c16040531f62baac60b46" FOREIGN KEY ("emitterId") REFERENCES "action_emitter_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_wrapper_entity" DROP CONSTRAINT "FK_5fbed4c16040531f62baac60b46"`);
        await queryRunner.query(`ALTER TABLE "action_emitter_entity" DROP CONSTRAINT "FK_904a09c9d5bd5cf3ddfc138bdf0"`);
        await queryRunner.query(`DROP TABLE "action_wrapper_entity"`);
        await queryRunner.query(`DROP TABLE "action_emitter_entity"`);
        await queryRunner.query(`DROP TABLE "exercise_wrapper_entity"`);
    }

}
