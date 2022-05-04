import type { UUID } from 'digital-fuesim-manv-shared';
// import type { ActionEmitter } from 'exercise/action-emitter';
import type { ActionWrapper } from 'exercise/action-wrapper';
import type { ActionEmitter, ExerciseWrapper } from 'exercise/exercise-wrapper';
import type { BaseEntity } from './base-entity';

// It is important to not export these types as otherwise TypeScript may use them in places where it shouldn't.

type CreateActionEmitter = Omit<ActionEmitter, 'exercise' | 'id'> & {
    exerciseId: UUID;
};

type UpdateActionEmitter = Partial<CreateActionEmitter>;

// TODO: Could there be helpers for the whole Omit<> & {}? (@Dassderdie)
type CreateActionWrapper = Omit<
    ActionWrapper,
    'action' | 'created' | 'emitter' | 'id'
> & {
    emitter: CreateActionEmitter;
};

type UpdateActionWrapper = Omit<Partial<CreateActionWrapper>, 'emitter'> & {
    emitter?: UUID;
};

type CreateExerciseWrapper = Omit<
    ExerciseWrapper,
    | 'actionHistory'
    | 'addClient'
    | 'applyAction'
    | 'clients'
    | 'currentState'
    | 'deleteExercise'
    | 'emitAction'
    | 'getRoleFromUsedId'
    | 'getStateSnapshot'
    | 'id'
    | 'initialState'
    | 'pause'
    | 'reduce'
    | 'refreshTreatmentInterval'
    | 'removeClient'
    | 'services'
    | 'setState'
    | 'start'
    | 'stateHistory'
    | 'tick'
    | 'tickCounter'
    | 'tickHandler'
    | 'tickInterval'
> & { tickCounter?: number };

type UpdateExerciseWrapper = Partial<CreateExerciseWrapper>;

export type Creatable<TEntity extends BaseEntity> =
    TEntity extends ActionEmitter
        ? CreateActionEmitter
        : TEntity extends ActionWrapper
        ? CreateActionWrapper
        : TEntity extends ExerciseWrapper
        ? CreateExerciseWrapper
        : never;

export type Updatable<TEntity extends BaseEntity> =
    TEntity extends ActionEmitter
        ? UpdateActionEmitter
        : TEntity extends ActionWrapper
        ? UpdateActionWrapper
        : TEntity extends ExerciseWrapper
        ? UpdateExerciseWrapper
        : never;
