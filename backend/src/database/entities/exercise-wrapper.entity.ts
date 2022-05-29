import { IsInt, IsJSON, IsString, MinLength, MaxLength } from 'class-validator';
import type { DatabaseService } from 'database/services/database-service';
import { ExerciseState } from 'digital-fuesim-manv-shared';
import type { ExerciseWrapper } from 'exercise/exercise-wrapper';
import { Entity, Column } from 'typeorm';
import type { ActionWrapperEntity } from './action-wrapper.entity';
import { BaseEntity } from './base-entity';

@Entity()
export class ExerciseWrapperEntity extends BaseEntity<
    ExerciseWrapperEntity,
    ExerciseWrapper
> {
    @Column({
        type: 'integer',
        default: 0,
    })
    @IsInt()
    tickCounter = 0;

    @Column({
        type: 'json',
    })
    @IsJSON()
    initialStateString!: string;

    @Column({ type: 'char', length: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    participantId!: string;

    @Column({ type: 'char', length: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(8)
    trainerId!: string;

    @Column({
        type: 'json',
    })
    @IsJSON()
    currentStateString!: string;

    @Column({ type: 'integer', default: 0 })
    @IsInt()
    stateVersion!: number;

    // This is not used by typeorm as this would clash with the approach of not saving every action in RAM.
    actions?: ActionWrapperEntity[];

    private constructor() {
        super();
    }

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This method does not guarantee a valid entity.
     */
    static createNew() {
        return new ExerciseWrapperEntity();
    }

    static async create(
        participantId: string,
        trainerId: string,
        databaseService: DatabaseService,
        initialState: ExerciseState = ExerciseState.create(),
        currentState: ExerciseState = initialState
    ): Promise<ExerciseWrapperEntity> {
        return databaseService.transaction(
            databaseService.exerciseWrapperService.getCreate({
                participantId,
                trainerId,
                initialStateString: JSON.stringify(initialState),
                currentStateString: JSON.stringify(currentState),
                stateVersion: ExerciseState.currentStateVersion,
            })
        );
    }
}
