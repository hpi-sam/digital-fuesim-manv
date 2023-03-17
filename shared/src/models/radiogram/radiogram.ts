import type { UUID } from '../../utils';
import type { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class Radiogram {
    readonly id!: UUID;
    readonly type!: `${string}Radiogram`;
    readonly simulatedRegionId!: UUID;
    readonly transmissionTime!: number;
    readonly status!: ExerciseRadiogramStatus;
}
