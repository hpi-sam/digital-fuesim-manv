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
import type { BaseEntity } from '../base-entity';
import type { Creatable, Updatable } from '../dtos';

export abstract class BaseService<TEntity extends BaseEntity> {
    public constructor(protected readonly dataSource: DataSource) {}

    /**
     * @param initialObject `undefined` for creating a new object, {@link TEntity} for updating an existing row.
     */
    protected abstract createSavableObject<
        TInitial extends TEntity | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends TEntity ? Updatable<TEntity> : Creatable<TEntity>,
        manager: EntityManager
    ): Promise<TEntity> | TEntity;

    protected abstract readonly entityTarget: EntityTarget<TEntity>;

    public async create(
        creator: Creatable<TEntity>,
        entityManager?: EntityManager
    ): Promise<TEntity> {
        const create = async (manager: EntityManager) =>
            manager.save(
                await this.createSavableObject(
                    undefined,
                    // TODO: TypeScript does strange things (@Dassderdie)
                    creator as any,
                    manager
                )
            );
        return entityManager
            ? create(entityManager)
            : this.dataSource.transaction(create);
    }

    public async findAll(
        options?: FindManyOptions<TEntity>,
        entityManager?: EntityManager
    ): Promise<TEntity[]> {
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
    public async findOne<TExists extends false | true>(
        options: FindOneOptions<TEntity>,
        mustExist: TExists,
        entityManager?: EntityManager
    ): Promise<TExists extends true ? TEntity : TEntity | null> {
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
        ) as Promise<TExists extends true ? TEntity : TEntity | null>;
    }

    /**
     * Finds the first row matching the {@link options} and returns it.
     * If no row matches uses {@link creatable} to create a new row and return this row.
     */
    public async findOneOrCreate(
        options: FindOneOptions<TEntity>,
        creatable: Creatable<TEntity>,
        entityManager?: EntityManager
    ): Promise<TEntity> {
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
    ): Promise<TEntity> {
        const find = async (manager: EntityManager) => {
            // See https://github.com/microsoft/TypeScript/issues/31070
            // and https://github.com/microsoft/TypeScript/issues/13442
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const where: FindOptionsWhere<TEntity> = {
                id,
            } as FindOptionsWhere<TEntity>;
            try {
                const tuple = await manager.findOneOrFail(this.entityTarget, {
                    where,
                });
                return tuple;
            } catch (e: unknown) {
                if (e instanceof EntityNotFoundError) {
                    throw new DatabaseError(
                        `\`${
                            (this.entityTarget as any).name
                        }\` with id \`${id}\` could not be found`,
                        e
                    );
                }
                throw e;
            }
        };
        return entityManager
            ? find(entityManager)
            : this.dataSource.transaction(find);
    }

    public async update(
        id: UUID,
        updater: Updatable<TEntity>,
        entityManager?: EntityManager
    ): Promise<TEntity> {
        const update = async (manager: EntityManager) => {
            const objectToUpdate = await this.findById(id, manager);
            return manager.save(
                await this.createSavableObject(objectToUpdate, updater, manager)
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
