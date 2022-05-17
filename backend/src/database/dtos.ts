import type { UUID } from 'digital-fuesim-manv-shared';
import type { ActionEmitterEntity } from './entities/action-emitter.entity';
import type { ActionWrapperEntity } from './entities/action-wrapper.entity';
import type { BaseEntity } from './entities/base-entity';
import type { ExerciseWrapperEntity } from './entities/exercise-wrapper.entity';

// It is important to not export these types as otherwise TypeScript may use them in places where it shouldn't.

type CreateActionEmitter = Omit<
    ActionEmitterEntity,
    'asNormal' | 'exercise' | 'id'
> & {
    exerciseId: UUID;
};

type UpdateActionEmitter = Partial<CreateActionEmitter>;

type CreateActionWrapper = Omit<
    ActionWrapperEntity,
    'asNormal' | 'created' | 'emitter' | 'id'
> & {
    emitter: CreateActionEmitter;
};

type UpdateActionWrapper = Omit<Partial<CreateActionWrapper>, 'emitter'> & {
    emitter?: UUID;
};

type CreateExerciseWrapper = Omit<
    ExerciseWrapperEntity,
    'asNormal' | 'id' | 'tickCounter'
> & {
    tickCounter?: number;
};

type UpdateExerciseWrapper = Partial<CreateExerciseWrapper>;

export type Creatable<Entity extends BaseEntity<Entity, any>> =
    Entity extends ActionEmitterEntity
        ? CreateActionEmitter
        : Entity extends ActionWrapperEntity
        ? CreateActionWrapper
        : Entity extends ExerciseWrapperEntity
        ? CreateExerciseWrapper
        : never;

export type Updatable<Entity extends BaseEntity<Entity, any>> =
    Entity extends ActionEmitterEntity
        ? UpdateActionEmitter
        : Entity extends ActionWrapperEntity
        ? UpdateActionWrapper
        : Entity extends ExerciseWrapperEntity
        ? UpdateExerciseWrapper
        : never;
