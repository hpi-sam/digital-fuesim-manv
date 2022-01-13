import type { ExerciseState, ExerciseAction } from '..';
import type { Role } from '../models/utils';

export interface ServerToClientEvents {
    performAction: (action: ExerciseAction) => void;
}

export interface ClientToServerEvents {
    joinExercise: (
        exerciseId: string,
        clientName: string,
        role: Role,
        callback: (response: SocketResponse) => void
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
