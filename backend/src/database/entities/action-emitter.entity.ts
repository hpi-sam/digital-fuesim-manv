// import { ActionEmitterEntityAll } from './all-entities';

// // eslint-disable-next-line @typescript-eslint/naming-convention
// export const ActionEmitterEntity = ActionEmitterEntityAll;
// // eslint-disable-next-line @typescript-eslint/no-redeclare
// export type ActionEmitterEntity = ActionEmitterEntityAll;

// // import { Type } from 'class-transformer';
// // import {
// //     IsOptional,
// //     IsString,
// //     IsUUID,
// //     MaxLength,
// //     ValidateNested,
// // } from 'class-validator';
// // import { UUID, uuidValidationOptions } from 'digital-fuesim-manv-shared';
// // import type { EntityManager } from 'typeorm';
// // import { Column, Entity, ManyToOne } from 'typeorm';
// // import type { ServiceProvider } from '../services/service-provider';
// // import { ActionEmitter } from '../../exercise/action-emitter';
// // import type { ExerciseWrapper } from '../../exercise/exercise-wrapper';
// // import { BaseEntity } from './base-entity';
// // import { ExerciseWrapperEntity } from './exercise-wrapper.entity';

// // @Entity()
// // export class ActionEmitterEntity extends BaseEntity<
// //     ActionEmitterEntity,
// //     ActionEmitter
// // > {
// //     async asNormal(
// //         services: ServiceProvider,
// //         entityManager?: EntityManager,
// //         exercise?: ExerciseWrapper
// //     ): Promise<ActionEmitter> {
// //         const normal = new ActionEmitter(services);
// //         normal.emitterId = this.emitterId;
// //         normal.emitterName = this.emitterName;
// //         normal.exercise =
// //             exercise && exercise.id === this.exercise.id
// //                 ? exercise
// //                 : await this.exercise.asNormal(services);
// //         normal.id = this.id;
// //         return normal;
// //     }

// //     @Column({ type: 'uuid', unique: true })
// //     @IsUUID(4, uuidValidationOptions)
// //     emitterId!: UUID;

// //     /**
// //      * `undefined` iff this emitter is the server
// //      */
// //     @Column({
// //         type: 'varchar',
// //         length: 255,
// //         nullable: true,
// //     })
// //     @IsString()
// //     @IsOptional()
// //     @MaxLength(255)
// //     emitterName?: string;

// //     @ManyToOne(() => ExerciseWrapperEntity, {
// //         onDelete: 'CASCADE',
// //         onUpdate: 'CASCADE',
// //         nullable: false,
// //         eager: true,
// //     })
// //     @ValidateNested()
// //     @Type(() => ExerciseWrapperEntity)
// //     exercise!: ExerciseWrapperEntity;
// // }
