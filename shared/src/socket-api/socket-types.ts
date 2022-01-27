import type { ExerciseState, ExerciseAction, UUID } from '..';
import type { Role } from '../models/utils';

export interface ServerToClientEvents {
    performAction: (action: ExerciseAction) => void;
}

// The last argument is always expected to be the callback function. (To be able to use it in advanced typings)
export interface ClientToServerEvents {
    joinExercise: (
        exerciseId: string,
        clientName: string,
        role: Role,
        callback: (response: SocketResponse<UUID>) => void
    ) => void;
    proposeAction: (
        action: ExerciseAction,
        callback: (response: SocketResponse) => void
    ) => void;
    getState: (
        callback: (response: SocketResponse<ExerciseState>) => void
    ) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export type SocketResponse<T = undefined> =
    | (T extends undefined
          ? {
                success: true;
            }
          : {
                success: true;
                payload: T;
            })
    | {
          success: false;
          message: string;
      };
