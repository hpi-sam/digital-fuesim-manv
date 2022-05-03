import type { UUID } from 'digital-fuesim-manv-shared';
import type {
    DataSource,
    DeleteResult,
    EntityManager,
    EntityTarget,
    FindManyOptions,
    FindOptionsWhere,
} from 'typeorm';
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

    public async findOne(
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
            return manager.findOneOrFail(this.entityTarget, {
                where,
            });
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
            const objectToUpdate = await this.findOne(id, manager);
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
