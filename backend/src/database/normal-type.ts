import type { UUID } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import type { BaseEntity } from './entities/base-entity';
import type { DatabaseService } from './services/database-service';

export abstract class NormalType<
    TSelf extends NormalType<TSelf, EntityType>,
    EntityType extends BaseEntity<any, TSelf>
> {
    protected constructor(
        protected readonly databaseService: DatabaseService
    ) {}
    id?: UUID;

    abstract asEntity(
        save: boolean,
        entityManager?: EntityManager
    ): Promise<EntityType>;

    /**
     * Creates or updates the object in the database
     */
    async save(entityManager?: EntityManager): Promise<EntityType> {
        return this.asEntity(true, entityManager);
    }
}
