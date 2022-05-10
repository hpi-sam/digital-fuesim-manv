// import { ExerciseWrapperEntityAll } from './all-entities';

// // eslint-disable-next-line @typescript-eslint/naming-convention
// export const ExerciseWrapperEntity = ExerciseWrapperEntityAll;
// // eslint-disable-next-line @typescript-eslint/no-redeclare
// export type ExerciseWrapperEntity = ExerciseWrapperEntityAll;

// // import { IsInt, IsJSON, IsString, MinLength, MaxLength } from 'class-validator';
// // import { ExerciseState } from 'digital-fuesim-manv-shared';
// // import type { EntityManager } from 'typeorm';
// // import { Entity, IsNull, Column } from 'typeorm';
// // import type { ServiceProvider } from '../services/service-provider';
// // import type { ActionWrapper } from '../../exercise/action-wrapper';
// // import { ExerciseWrapper } from '../../exercise/exercise-wrapper';
// // import { BaseEntity } from './base-entity';

// // @Entity()
// // export class ExerciseWrapperEntity extends BaseEntity<
// //     ExerciseWrapperEntity,
// //     ExerciseWrapper
// // > {
// //     async asNormal(
// //         services: ServiceProvider,
// //         entityManager?: EntityManager
// //     ): Promise<ExerciseWrapper> {
// //         const operations = async (manager: EntityManager) => {
// //             const actions = await services.actionWrapperService.findAll(
// //                 {
// //                     where: {
// //                         emitter: {
// //                             exercise: {
// //                                 id: this.id,
// //                             },
// //                         },
// //                     },
// //                     order: {
// //                         created: 'ASC',
// //                     },
// //                 },
// //                 manager
// //             );
// //             const actionsInWrapper: ActionWrapper[] = [];
// //             const normal = new ExerciseWrapper(
// //                 this.participantId,
// //                 this.trainerId,
// //                 actionsInWrapper,
// //                 services,
// //                 JSON.parse(this.initialStateString) as ExerciseState,
// //                 (
// //                     await services.actionEmitterService.findOne(
// //                         {
// //                             where: {
// //                                 exercise: { id: this.id },
// //                                 emitterName: IsNull(),
// //                             },
// //                         },
// //                         false,
// //                         manager
// //                     )
// //                 )?.emitterId ?? undefined
// //             );
// //             actionsInWrapper.splice(
// //                 0,
// //                 0,
// //                 ...(await Promise.all(
// //                     actions.map(async (action) =>
// //                         action.asNormal(services, manager, normal)
// //                     )
// //                 ))
// //             );
// //             normal.id = this.id;
// //             normal.tickCounter = this.tickCounter;
// //             return normal;
// //         };
// //         return entityManager
// //             ? operations(entityManager)
// //             : services.transaction(operations);
// //     }

// //     @Column({
// //         type: 'integer',
// //         default: 0,
// //     })
// //     @IsInt()
// //     tickCounter = 0;

// //     @Column({
// //         type: 'json',
// //     })
// //     @IsJSON()
// //     initialStateString!: string;

// //     @Column({ type: 'char', length: 6 })
// //     @IsString()
// //     @MinLength(6)
// //     @MaxLength(6)
// //     participantId!: string;

// //     @Column({ type: 'char', length: 8 })
// //     @IsString()
// //     @MinLength(8)
// //     @MaxLength(8)
// //     trainerId!: string;

// //     /**
// //      * Be very careful when using this. - Use {@link create} instead for most use cases.
// //      * This constructor does not guarantee a valid entity.
// //      */
// //     // eslint-disable-next-line @typescript-eslint/no-useless-constructor
// //     constructor() {
// //         super();
// //     }

// //     static async create(
// //         participantId: string,
// //         trainerId: string,
// //         services: ServiceProvider,
// //         initialState: ExerciseState = ExerciseState.create()
// //     ): Promise<ExerciseWrapperEntity> {
// //         const exercise = await services.exerciseWrapperService.create({
// //             participantId,
// //             trainerId,
// //             initialStateString: JSON.stringify(initialState),
// //         });

// //         return exercise;
// //     }
// // }
