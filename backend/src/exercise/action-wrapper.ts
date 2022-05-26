import type { ExerciseAction, UUID } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { NormalType } from '../database/normal-type';
import { ActionWrapperEntity } from '../database/entities/action-wrapper.entity';
import type { DatabaseService } from '../database/services/database-service';
import type { ExerciseWrapperEntity } from '../database/entities/exercise-wrapper.entity';
import type { ExerciseWrapper } from './exercise-wrapper';

export class ActionWrapper extends NormalType<
    ActionWrapper,
    ActionWrapperEntity
> {
    async asEntity(
        save: boolean,
        entityManager?: EntityManager,
        exerciseEntity?: ExerciseWrapperEntity
    ): Promise<ActionWrapperEntity> {
        const operations = async (manager: EntityManager) => {
            let entity = this.id
                ? await this.databaseService.actionWrapperService.findById(
                      this.id,
                      manager
                  )
                : new ActionWrapperEntity();
            const existed = this.id !== undefined;
            entity.actionString = JSON.stringify(this.action);
            entity.index = this.index;
            entity.exercise =
                exerciseEntity ?? (await this.exercise.asEntity(save, manager));
            entity.emitterId = this.emitterId;
            if (this.id) entity.id = this.id;
            if (save) {
                if (existed) {
                    entity =
                        await this.databaseService.actionWrapperService.update(
                            entity.id,
                            {
                                actionString: entity.actionString,
                                emitterId: entity.emitterId,
                                exerciseId: entity.exercise.id,
                            },
                            manager
                        );
                } else {
                    entity =
                        await this.databaseService.actionWrapperService.create(
                            {
                                actionString: entity.actionString,
                                emitterId: entity.emitterId,
                                exerciseId: entity.exercise.id,
                                index: entity.index,
                            },
                            manager
                        );
                }
                this.id = entity.id;
            }
            return entity!;
        };
        return entityManager
            ? operations(entityManager)
            : this.databaseService.transaction(operations);
    }

    static createFromEntity(
        entity: ActionWrapperEntity,
        databaseService: DatabaseService,
        exercise: ExerciseWrapper
    ): ActionWrapper {
        return new ActionWrapper(
            databaseService,
            JSON.parse(entity.actionString),
            entity.emitterId,
            exercise,
            entity.index,
            entity.id
        );
    }

    public readonly index!: number;

    /**
     * @param emitterId `null` iff the emitter was the server, the client id otherwise
     */
    constructor(
        databaseService: DatabaseService,
        public readonly action: ExerciseAction,
        public readonly emitterId: UUID | null,
        public readonly exercise: ExerciseWrapper,
        index?: number,
        id?: UUID
    ) {
        super(databaseService);
        if (id) this.id = id;
        this.index = index ?? exercise.incrementIdGenerator.next();
    }
}
