import { ExerciseState, ExerciseAction } from '..';

export interface ServerToClientEvents {
    performAction: (action: ExerciseAction) => void;
}

export interface ClientToServerEvents {
    joinExercise: (
        exerciseId: string,
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
    | {
          success: false;
          message: string;
      }
    | (T extends undefined
          ? {
                success: true;
            }
          : {
                success: true;
                payload: T;
            });
