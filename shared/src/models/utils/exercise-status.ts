import type { AllowedValues } from '../../utils/validators';

export type ExerciseStatus = 'notStarted' | 'paused' | 'running';

export const exerciseStatusAllowedValues: AllowedValues<ExerciseStatus> = {
    notStarted: true,
    paused: true,
    running: true,
};
