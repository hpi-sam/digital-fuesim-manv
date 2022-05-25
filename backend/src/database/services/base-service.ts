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

    public async create(
        creator: Creatable,
        entityManager?: EntityManager
    ): Promise<Entity> {
        const create = async (manager: EntityManager) =>
            manager.save(await this.getCreateEntityObject(creator, manager));
        return entityManager
            ? create(entityManager)
            : this.dataSource.transaction(create);
    }

    public async findAll(
        options?: FindManyOptions<Entity>,
        entityManager?: EntityManager
    ): Promise<Entity[]> {
        const find = async (manager: EntityManager) =>
            manager.find(this.entityTarget, options);
        return entityManager
            ? find(entityManager)
            : this.dataSource.transaction(find);
    }

    /**
     * Finds the first row matching the {@link options}.
     *
     * @returns The found row, or `null` if no matching row was found and {@link mustExist} is `false`.
     * @throws {@link DatabaseError} when {@link mustExist} is `true` and no row has been found.
     */
    public async findOne<TExists extends boolean>(
        options: FindOneOptions<Entity>,
        mustExist: TExists,
        entityManager?: EntityManager
    ): Promise<TExists extends true ? Entity : Entity | null> {
        const find = async (manager: EntityManager) => {
            const tuple = await manager.findOne(this.entityTarget, options);
            if (mustExist && tuple === null) {
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
        // TypeScript can't get the correct typings for this.
        return (
            entityManager
                ? find(entityManager)
                : this.dataSource.transaction(find)
        ) as Promise<TExists extends true ? Entity : Entity | null>;
    }

    /**
     * Finds the first row matching the {@link options} and returns it.
     * If no row matches uses {@link creatable} to create a new row and return this row.
     */
    public async findOneOrCreate(
        options: FindOneOptions<Entity>,
        creatable: Creatable,
        entityManager?: EntityManager
    ): Promise<Entity> {
        const find = async (manager: EntityManager) =>
            (await this.findOne(options, false, manager)) ??
            (await this.create(creatable, manager));
        return entityManager
            ? find(entityManager)
            : this.dataSource.transaction(find);
    }

    /**
     * @throws {@link DatabaseError} when id does not exist
     */
    public async findById(
        id: UUID,
        entityManager?: EntityManager
    ): Promise<Entity> {
        const find = async (manager: EntityManager) =>
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
        return entityManager
            ? find(entityManager)
            : this.dataSource.transaction(find);
    }

    public async update(
        id: UUID,
        updater: Updatable,
        entityManager?: EntityManager
    ): Promise<Entity> {
        const update = async (manager: EntityManager) => {
            const objectToUpdate = await this.findById(id, manager);
            return manager.save(
                await this.getUpdateEntityObject(
                    objectToUpdate,
                    updater,
                    manager
                )
            );
        };
        return entityManager
            ? update(entityManager)
            : this.dataSource.transaction(update);
    }

    public async remove(
        id: UUID,
        entityManager?: EntityManager
    ): Promise<DeleteResult> {
        const remove = async (manager: EntityManager) =>
            manager.delete(this.entityTarget, id);
        return entityManager
            ? remove(entityManager)
            : this.dataSource.transaction(remove);
    }
}
