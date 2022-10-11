import type { ExerciseState } from 'digital-fuesim-manv-shared';
import type { ApplicationState } from './application/application.state';

export interface AppState {
    readonly exercise: ExerciseState;
    readonly application: ApplicationState;
}
