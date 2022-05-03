// TODO: This can't be used due to circular imports. Class has been moved to exercise-wrapper file for now. (@Dassderdie)

// import { Type } from 'class-transformer';
// import { IsJSON, MaxLength, ValidateNested } from 'class-validator';
// import type { ExerciseAction } from 'digital-fuesim-manv-shared';
// import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
// import type { Creatable } from '../database/dtos';
// import { BaseEntity } from '../database/base-entity';
// import type { ServiceProvider } from '../database/services/service-provider';
// import { ActionEmitter } from './action-emitter';
// import { ExerciseWrapper } from './exercise-wrapper';

// @Entity()
// export class ActionWrapper extends BaseEntity {
//     // TODO: Make this cascading also in the other direction.
//     // Alternative: Make this a many-to-one where the same emitter is used for multiple wrappers.
//     @OneToOne(() => ActionEmitter, {
//         onDelete: 'CASCADE',
//         onUpdate: 'CASCADE',
//         nullable: false,
//         eager: true,
//     })
//     @JoinColumn()
//     @ValidateNested()
//     @Type(() => ActionEmitter)
//     emitter!: ActionEmitter;

//     get action(): ExerciseAction {
//         return JSON.parse(this.actionString);
//     }

//     @Column({
//         type: 'json',
//         // TODO: This is a guess. Verify it with actual data
//         // length: 65535,
//     })
//     @IsJSON()
//     @MaxLength(65535)
//     actionString!: string;

//     @ManyToOne(() => ExerciseWrapper)
//     @ValidateNested()
//     @Type(() => ExerciseWrapper)
//     exercise!: ExerciseWrapper;

//     static async create(
//         action: ExerciseAction,
//         emitter: Creatable<ActionEmitter>,
//         exercise: ExerciseWrapper,
//         services: ServiceProvider
//     ): Promise<ActionWrapper> {
//         return services.actionWrapperService.create({
//             actionString: JSON.stringify(action),
//             emitter,
//             exerciseId: exercise.id,
//         });
//     }
// }
