import type { ExerciseSocket } from '../exercise-server.js';
import type { ClientWrapper } from './client-wrapper.js';

export const clientMap = new Map<ExerciseSocket, ClientWrapper>();
