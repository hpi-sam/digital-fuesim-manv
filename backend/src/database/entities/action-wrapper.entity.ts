// import { ActionWrapperEntityAll } from './all-entities';

// // eslint-disable-next-line @typescript-eslint/naming-convention
// export const ActionWrapperEntity = ActionWrapperEntityAll;
// // eslint-disable-next-line @typescript-eslint/no-redeclare
// export type ActionWrapperEntity = ActionWrapperEntityAll;

// // import type { ExerciseAction, UUID } from 'digital-fuesim-manv-shared';
// // import type { EntityManager } from 'typeorm';
// // import { Column, Entity, ManyToOne } from 'typeorm';
// // import { IsJSON, ValidateNested } from 'class-validator';
// // import { Type } from 'class-transformer';
// // import { ActionWrapper } from '../../exercise/action-wrapper';
// // import type { ExerciseWrapper } from '../../exercise/exercise-wrapper';
// // import type { ServiceProvider } from '../services/service-provider';
// // import type { Creatable } from '../dtos';
// // import { BaseEntity } from './base-entity';
// // import { ActionEmitterEntity } from './action-emitter.entity';

// // @Entity()
// // export class ActionWrapperEntity extends BaseEntity<
// //     ActionWrapperEntity,
// //     ActionWrapper
// // > {
// //     async asNormal(
// //         services: ServiceProvider,
// //         entityManager?: EntityManager,
// //         exercise?: ExerciseWrapper
// //     ): Promise<ActionWrapper> {
// //         const normal = new ActionWrapper(services);
// //         normal.action = JSON.parse(this.actionString);
// //         normal.emitter = await this.emitter.asNormal(
// //             services,
// //             entityManager,
// //             exercise
// //         );
// //         normal.id = this.id;
// //         return normal;
// //     }

// //     @ManyToOne(() => ActionEmitterEntity, {
// //         onDelete: 'CASCADE',
// //         onUpdate: 'CASCADE',
// //         nullable: false,
// //         eager: true,
// //     })
// //     @ValidateNested()
// //     @Type(() => ActionEmitterEntity)
// //     emitter!: ActionEmitterEntity;

// //     @Column({
// //         type: 'timestamp with time zone',
// //         default: () => 'CURRENT_TIMESTAMP',
// //     })
// //     created!: Date;

// //     @Column({
// //         type: 'json',
// //     })
// //     @IsJSON()
// //     actionString!: string;

// //     /**
// //      * Be very careful when using this. - Use {@link create} instead for most use cases.
// //      * This constructor does not guarantee a valid entity.
// //      */
// //     // eslint-disable-next-line @typescript-eslint/no-useless-constructor
// //     constructor() {
// //         super();
// //     }

// //     static async create(
// //         action: ExerciseAction,
// //         emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>,
// //         exerciseId: UUID,
// //         services: ServiceProvider
// //     ): Promise<ActionWrapperEntity> {
// //         return services.actionWrapperService.create({
// //             actionString: JSON.stringify(action),
// //             emitter: { ...emitter, exerciseId },
// //         });
// //     }
// // }
