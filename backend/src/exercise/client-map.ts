import type { ExerciseSocket } from '../exercise-server';
import type { Client } from './clients';

export const clientMap = new Map<ExerciseSocket, Client>();
