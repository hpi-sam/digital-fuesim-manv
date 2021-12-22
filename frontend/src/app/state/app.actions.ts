import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import type { SetExerciseAction } from './exercise/set-exercise';

export type AppAction = ExerciseAction | SetExerciseAction;
