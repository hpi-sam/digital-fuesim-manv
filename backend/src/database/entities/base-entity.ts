import { IsUUID } from 'class-validator';
import type { NormalType } from 'database/normal-type';
import { UUID, uuidValidationOptions } from 'digital-fuesim-manv-shared';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity<
    TSelf extends BaseEntity<TSelf, NormalEntity>,
    NormalEntity extends NormalType<any, TSelf>,
> {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID(4, uuidValidationOptions)
    id!: UUID;
}
