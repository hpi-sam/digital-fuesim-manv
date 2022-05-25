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
            const getFromDatabase = async () =>
                this.databaseService.actionWrapperService.getFindById(this.id!)(
                    manager
                );
            const getNew = () => ActionWrapperEntity.createNew();
            const copyData = async (entity: ActionWrapperEntity) => {
                entity.actionString = JSON.stringify(this.action);
                entity.index = this.index;
                entity.exercise =
                    exerciseEntity ??
                    (await this.exercise.asEntity(save, manager));
                entity.emitterId = this.emitterId;
            };
            const getDto = (entity: ActionWrapperEntity) => ({
                actionString: entity.actionString,
                emitterId: entity.emitterId,
                exerciseId: entity.exercise.id,
                index: entity.index,
            });
            const existed = this.id !== undefined;
            if (save && existed) {
                const entity = await getFromDatabase();
                entity.id = this.id!;
                await copyData(entity);

                const savedEntity =
                    await this.databaseService.actionWrapperService.getUpdate(
                        entity.id,
                        getDto(entity)
                    )(manager);
                this.id = savedEntity.id;
                return savedEntity;
            } else if (save && !existed) {
                const entity = getNew();
                await copyData(entity);

                const savedEntity =
                    await this.databaseService.actionWrapperService.getCreate(
                        getDto(entity)
                    )(manager);
                this.id = savedEntity.id;
                return savedEntity;
            } else if (!save && existed) {
                const entity = await getFromDatabase();
                entity.id = this.id!;
                await copyData(entity);
                return entity;
                // eslint-disable-next-line no-else-return
            } else {
                const entity = getNew();
                await copyData(entity);
                return entity;
            }
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
        // // eslint-disable-next-line @typescript-eslint/no-useless-constructor
        // constructor(services: ServiceProvider) {
        //     super(services);
        // }

        // static async create(
        //     action: ExerciseAction,
        //     emitter: Omit<CreateActionEmitter, 'exerciseId'>,
        //     exercise: ExerciseWrapper,
        //     services: ServiceProvider,
        //     entityManager?: EntityManager
        // ): Promise<ActionWrapper> {
        //     const create = async (manager: EntityManager) => {
        //         const exerciseEntity = await exercise.asEntity(true, manager);
        //         const entity = await ActionWrapperEntity.create(
        //             action,
        //             { ...emitter, exerciseId: exerciseEntity.id },
        //             services,
        //             manager
        //         );

        //         const normal = await ActionWrapper.createFromEntity(
        //             entity,
        //             services,
        //             manager
        //         );

        //         return normal;
        //     };
        //     return entityManager
        //         ? create(entityManager)
        //         : services.transaction(create);
    }
}
