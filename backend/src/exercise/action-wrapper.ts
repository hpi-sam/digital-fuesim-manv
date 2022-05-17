import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import type { ActionEmitterEntity } from '../database/entities/action-emitter.entity';
import { NormalType } from '../database/normal-type';
import type { Creatable, Updatable } from '../database/dtos';
import { ActionWrapperEntity } from '../database/entities/action-wrapper.entity';
import type { ServiceProvider } from '../database/services/service-provider';
import { ActionEmitter } from './action-emitter';
import type { ExerciseWrapper } from './exercise-wrapper';

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
                ? await this.services.actionWrapperService.findById(
                      this.id,
                      manager
                  )
                : new ActionWrapperEntity();
            const existed = this.id !== undefined;
            entity.actionString = JSON.stringify(this.action);
            entity.created ??= new Date();
            entity.emitter = await this.emitter.asEntity(save, manager);
            if (this.id) entity.id = this.id;
            if (save) {
                if (existed) {
                    const updatable: Updatable<ActionWrapperEntity> = {
                        actionString: entity.actionString,
                        emitter: entity.emitter.id,
                    };
                    entity = await this.services.actionWrapperService.update(
                        entity.id,
                        updatable,
                        manager
                    );
                } else {
                    const creatable: Creatable<ActionWrapperEntity> = {
                        actionString: entity.actionString,
                        emitter: {
                            emitterId: entity.emitter.emitterId,
                            exerciseId: entity.emitter.exercise.id,
                            emitterName: entity.emitter.emitterName,
                        },
                    };

                    entity = await this.services.actionWrapperService.create(
                        creatable,
                        manager
                    );
                }
                this.id = entity.id;
            }
            return entity!;
        };
        return entityManager
            ? operations(entityManager)
            : this.services.transaction(operations);
    }

    static async createFromEntity(
        entity: ActionWrapperEntity,
        services: ServiceProvider,
        entityManager?: EntityManager,
        exercise?: ExerciseWrapper
    ): Promise<ActionWrapper> {
        const normal = new ActionWrapper(services);
        normal.action = JSON.parse(entity.actionString);
        normal.emitter = await ActionEmitter.createFromEntity(
            entity.emitter,
            services,
            entityManager,
            exercise
        );
        normal.id = entity.id;
        return normal;
    }

    emitter!: ActionEmitter;

    action!: ExerciseAction;

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid object.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(services: ServiceProvider) {
        super(services);
    }

    static async create(
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>,
        exercise: ExerciseWrapper,
        services: ServiceProvider
    ): Promise<ActionWrapper> {
        return services.transaction(async (manager) => {
            const exerciseEntity = await exercise.asEntity(true, manager);
            const entity = await ActionWrapperEntity.create(
                action,
                emitter,
                exerciseEntity.id,
                services,
                manager
            );

            const normal = await ActionWrapper.createFromEntity(
                entity,
                services,
                manager
            );

            return normal;
        });
    }
}
