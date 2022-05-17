import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    IsOptional,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { uuidValidationOptions, UUID } from 'digital-fuesim-manv-shared';
import type { ActionEmitter } from 'exercise/action-emitter';
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { ExerciseWrapperEntity } from './exercise-wrapper.entity';

@Entity()
export class ActionEmitterEntity extends BaseEntity<
    ActionEmitterEntity,
    ActionEmitter
> {
    @Column({ type: 'uuid', unique: true })
    @IsUUID(4, uuidValidationOptions)
    emitterId!: UUID;

    /**
     * `undefined` iff this emitter is the server
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    emitterName?: string;

    @ManyToOne(() => ExerciseWrapperEntity, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
        eager: true,
    })
    @ValidateNested()
    @Type(() => ExerciseWrapperEntity)
    exercise!: ExerciseWrapperEntity;
}
