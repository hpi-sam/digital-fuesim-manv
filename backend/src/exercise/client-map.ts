import type { ExerciseSocket } from '../exercise-server';
import type { ClientWrapper } from './client-wrapper';

export const clientMap = new Map<ExerciseSocket, ClientWrapper>();
