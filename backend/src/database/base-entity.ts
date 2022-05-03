import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from 'digital-fuesim-manv-shared';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID(4, uuidValidationOptions)
    id!: UUID;
}
