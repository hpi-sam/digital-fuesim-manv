import type { UUID } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { ActionEmitterEntity } from '../database/entities/action-emitter.entity';
import { NormalType } from '../database/normal-type';
import type { DatabaseService } from '../database/services/database-service';
import { ExerciseWrapper } from './exercise-wrapper';

// Keep this import for the JSDoc comment of the constructor.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ActionWrapper } from './action-wrapper';

export class ActionEmitter extends NormalType<
    ActionEmitter,
    ActionEmitterEntity
> {
    /**
     * Be very careful when using this. - Create an instance of this class via an {@link ActionWrapper} instead for most use cases.
     * This constructor does not guarantee a valid entity.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(services: DatabaseService) {
        super(services);
    }

    async asEntity(
        save: boolean,
        entityManager?: EntityManager
    ): Promise<ActionEmitterEntity> {
        const operations = async (manager: EntityManager) => {
            let entity = this.id
                ? await this.services.actionEmitterService.findById(
                      this.id,
                      manager
                  )
                : new ActionEmitterEntity();
            const existed = this.id !== undefined;

            entity.emitterId = this.emitterId;
            entity.emitterName = this.emitterName;
            entity.exercise = await this.exercise.asEntity(save, manager);
            if (this.id) entity.id = this.id;

            if (save) {
                if (existed) {
                    const updatable = {
                        emitterId: entity.emitterId,
                        emitterName: entity.emitterName,
                        exerciseId: entity.exercise.id,
                    };
                    entity = await this.services.actionEmitterService.update(
                        entity.id,
                        updatable,
                        manager
                    );
                } else {
                    const creatable = {
                        emitterId: entity.emitterId,
                        emitterName: entity.emitterName,
                        exerciseId: entity.exercise.id,
                    };
                    entity = await this.services.actionEmitterService.create(
                        creatable,
                        manager
                    );
                }
                this.id = entity.id;
            }

            return entity;
        };
        return entityManager
            ? operations(entityManager)
            : this.services.transaction(operations);
    }

    static async createFromEntity(
        entity: ActionEmitterEntity,
        services: DatabaseService,
        entityManager?: EntityManager,
        exercise?: ExerciseWrapper
    ): Promise<ActionEmitter> {
        const normal = new ActionEmitter(services);
        normal.emitterId = entity.emitterId;
        normal.emitterName = entity.emitterName;
        normal.exercise =
            exercise && exercise.id === entity.exercise.id
                ? exercise
                : await ExerciseWrapper.createFromEntity(
                      entity.exercise,
                      services,
                      entityManager
                  );
        normal.id = entity.id;
        return normal;
    }

    emitterId!: UUID;

    /**
     * `undefined` iff this emitter is the server
     */
    emitterName?: string;

    exercise!: ExerciseWrapper;
}
