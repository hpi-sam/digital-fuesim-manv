import { IsUUID } from 'class-validator';
import type { NormalType } from 'database/normal-type';
import type { ServiceProvider } from 'database/services/service-provider';
import { UUID, uuidValidationOptions } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity<
    TSelf extends BaseEntity<TSelf, NormalEntity>,
    NormalEntity extends NormalType<any, TSelf>
> {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID(4, uuidValidationOptions)
    id!: UUID;

    // TODO: Better name for the whole `normal`/`Normal` stuff
    abstract asNormal(
        services: ServiceProvider,
        entityManager?: EntityManager
    ): NormalEntity | Promise<NormalEntity>;
}
