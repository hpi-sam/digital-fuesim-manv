// TODO: This can't be used due to circular imports. Class has been moved to exercise-wrapper file for now. (@Dassderdie)
// import { Type } from 'class-transformer';
// import {
//     IsString,
//     MaxLength,
//     IsOptional,
//     ValidateNested,
// } from 'class-validator';
// import type { UUID } from 'digital-fuesim-manv-shared';
// import { Entity, Column, ManyToOne } from 'typeorm';
// import { BaseEntity } from '../database/base-entity';
// import { ExerciseWrapper } from './exercise-wrapper';

// @Entity()
// export class ActionEmitter extends BaseEntity {
//     // TODO: Select a UUID for the server (@ClFeSc, @hpistudent72)
//     @Column({
//         type: 'varchar',
//         length: 36,
//         unique: true,
//     })
//     @IsString()
//     @MaxLength(36)
//     emitterId!: UUID | 'server';

//     /**
//      * `undefined` iff {@link emitterId}` === 'server'`
//      */
//     @Column({
//         type: 'varchar',
//         // TODO: Restrict this length in shared (@ClFeSc, @hpistudent72)
//         length: 255,
//         nullable: true,
//     })
//     @IsString()
//     @IsOptional()
//     @MaxLength(255)
//     emitterName?: string;

//     @ManyToOne(() => ExerciseWrapper)
//     @ValidateNested()
//     @Type(() => ExerciseWrapper)
//     exercise!: ExerciseWrapper;
// }
