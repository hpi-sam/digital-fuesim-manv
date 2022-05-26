import type { UUID } from 'digital-fuesim-manv-shared';
import type {
    DataSource,
    DeleteResult,
    EntityManager,
    EntityTarget,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
} from 'typeorm';
import { EntityNotFoundError } from 'typeorm';
import { DatabaseError } from '../database-error';
import type { BaseEntity } from '../entities/base-entity';

/**
 * Provides the general API for interacting with the database for a specific {@link BaseEntity}
 */
export abstract class BaseService<
    Entity extends BaseEntity<Entity, any>,
    Creatable,
    Updatable
> {
    public constructor(protected readonly dataSource: DataSource) {}

    protected abstract getCreateEntityObject(
        dto: Creatable,
        manager: EntityManager
    ): Entity | Promise<Entity>;

    protected abstract getUpdateEntityObject(
        initialObject: Entity,
        dto: Updatable,
        manager: EntityManager
    ): Entity | Promise<Entity>;

    protected abstract readonly entityTarget: EntityTarget<Entity>;

    public getCreate(
        creator: Creatable
    ): (entityManager: EntityManager) => Promise<Entity> {
        return async (manager: EntityManager) =>
            manager.save(await this.getCreateEntityObject(creator, manager));
    }

    public getFindAll(
        options?: FindManyOptions<Entity>
    ): (entityManager: EntityManager) => Promise<Entity[]> {
        return async (manager: EntityManager) =>
            manager.find(this.entityTarget, options);
    }

    /**
     * Finds the first row matching the {@link options}.
     *
     * @returns The found row, or `null` if no matching row was found.
     */
    public getFindOne(
        options: FindOneOptions<Entity>
    ): (entityManager: EntityManager) => Promise<Entity | null> {
        return async (manager: EntityManager) =>
            manager.findOne(this.entityTarget, options);
    }

    /**
     * Finds the first row matching the {@link options}.
     *
     * @returns The found row.
     * @throws {@link DatabaseError} when no row has been found.
     */
    public getGetOne(
        options: FindOneOptions<Entity>
    ): (entityManager: EntityManager) => Promise<Entity | null> {
        return async (manager: EntityManager) => {
            const tuple = await this.getFindOne(options)(manager);
            if (tuple === null) {
                throw new DatabaseError(
                    `\`${
                        this.entityTarget.constructor.name
                    }\` with options \`${JSON.stringify(
                        options
                    )}\` could not be found.`
                );
            }
            return tuple;
        };
    }

    /**
     * Finds the first row matching the {@link options} and returns it.
     * If no row matches uses {@link creatable} to create a new row and return this row.
     */
    public getFindOneOrCreate(
        options: FindOneOptions<Entity>,
        creatable: Creatable
    ): (entityManager: EntityManager) => Promise<Entity> {
        return async (manager: EntityManager) =>
            (await this.getFindOne(options)(manager)) ??
            (await this.getCreate(creatable)(manager));
    }

    /**
     * @throws {@link DatabaseError} when id does not exist
     */
    public getFindById(
        id: UUID
    ): (entityManager: EntityManager) => Promise<Entity> {
        return async (manager: EntityManager) =>
            manager
                .findOneOrFail(this.entityTarget, {
                    // See https://github.com/microsoft/TypeScript/issues/31070
                    // and https://github.com/microsoft/TypeScript/issues/13442
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    where: {
                        id,
                    } as FindOptionsWhere<Entity>,
                })
                .catch((e: unknown) => {
                    if (e instanceof EntityNotFoundError) {
                        throw new DatabaseError(
                            `\`${
                                (this.entityTarget as any).name
                            }\` with id \`${id}\` could not be found`,
                            e
                        );
                    }
                    throw e;
                });
    }

    public getUpdate(
        id: UUID,
        updater: Updatable
    ): (entityManager: EntityManager) => Promise<Entity> {
        return async (manager: EntityManager) => {
            const objectToUpdate = await this.getFindById(id)(manager);
            return manager.save(
                await this.getUpdateEntityObject(
                    objectToUpdate,
                    updater,
                    manager
                )
            );
        };
    }

    public getRemove(
        id: UUID
    ): (entityManager: EntityManager) => Promise<DeleteResult> {
        return async (manager: EntityManager) =>
            manager.delete(this.entityTarget, id);
    }
}
