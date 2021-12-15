import { ExerciseAction } from 'digital-fuesim-manv-shared';
import { SetExerciseAction } from './exercise/set-exercise';

export type AppAction = ExerciseAction | SetExerciseAction;
