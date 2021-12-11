import { ExerciseSocket } from '../exercise-server';
import { Client } from './clients';

export const clientMap = new Map<ExerciseSocket, Client>();
