import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExerciseAndActions1653554608164 implements MigrationInterface {
    name = 'AddExerciseAndActions1653554608164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exercise_wrapper_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tickCounter" integer NOT NULL DEFAULT '0', "initialStateString" json NOT NULL, "participantId" character(6) NOT NULL, "trainerId" character(8) NOT NULL, "currentStateString" json NOT NULL, CONSTRAINT "PK_9984051806086844283a599d805" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_wrapper_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emitterId" uuid, "index" bigint NOT NULL, "actionString" json NOT NULL, "exerciseId" uuid NOT NULL, CONSTRAINT "PK_d2a88101a67c9fc3be6590969d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_wrapper_entity" ADD CONSTRAINT "FK_180a58767f06b503216ba2b0982" FOREIGN KEY ("exerciseId") REFERENCES "exercise_wrapper_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_wrapper_entity" DROP CONSTRAINT "FK_180a58767f06b503216ba2b0982"`);
        await queryRunner.query(`DROP TABLE "action_wrapper_entity"`);
        await queryRunner.query(`DROP TABLE "exercise_wrapper_entity"`);
    }

}
