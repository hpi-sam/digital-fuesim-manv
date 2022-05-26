import type { ExerciseAction, UUID } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { NormalType } from '../database/normal-type';
import { ActionWrapperEntity } from '../database/entities/action-wrapper.entity';
import type { DatabaseService } from '../database/services/database-service';
import { ExerciseWrapper } from './exercise-wrapper';

export class ActionWrapper extends NormalType<
    ActionWrapper,
    ActionWrapperEntity
> {
    async asEntity(
        save: boolean,
        entityManager?: EntityManager
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
            entity.exercise = await this.exercise.asEntity(save, manager);
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

    static async createFromEntity(
        entity: ActionWrapperEntity,
        databaseService: DatabaseService,
        entityManager?: EntityManager,
        exercise?: ExerciseWrapper
    ): Promise<ActionWrapper> {
        const normal = new ActionWrapper(databaseService);
        normal.action = JSON.parse(entity.actionString);
        normal.emitterId = entity.emitterId;
        normal.exercise =
            exercise ??
            (await ExerciseWrapper.createFromEntity(
                entity.exercise,
                databaseService,
                entityManager
            ));
        normal.id = entity.id;
        normal.index = entity.index;
        return normal;
    }

    /**
     * `null` iff the emitter was the server
     */
    emitterId!: UUID | null;

    exercise!: ExerciseWrapper;

    action!: ExerciseAction;

    index!: number;

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid object.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(databaseService: DatabaseService) {
        super(databaseService);
    }

    static async create(
        action: ExerciseAction,
        emitterId: UUID | null,
        exercise: ExerciseWrapper,
        databaseService: DatabaseService
    ): Promise<ActionWrapper> {
        return databaseService.transaction(async (manager) => {
            const exerciseEntity = await exercise.asEntity(true, manager);
            const entity = await ActionWrapperEntity.create(
                action,
                emitterId,
                exerciseEntity,
                exercise.incrementIdGenerator.next(),
                databaseService,
                manager
            );

            const normal = await ActionWrapper.createFromEntity(
                entity,
                databaseService,
                manager
            );

            return normal;
        });
    }
}
