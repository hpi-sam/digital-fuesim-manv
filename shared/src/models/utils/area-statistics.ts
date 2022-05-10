import { IsInt, IsObject, IsPositive } from 'class-validator';
import type { Vehicle } from '../vehicle';
import { getCreate } from './get-create';
import type { PatientStatus } from './patient-status';

/**
 * The statistics for an area in the exercise (e.g. a viewport or the whole exercise).
 */
export class AreaStatistics {
    @IsObject()
    readonly patients: {
        readonly [visibleStatus in PatientStatus]?: number;
    };

    @IsObject()
    readonly vehicles: {
        readonly [vehicleType: Vehicle['vehicleType']]: number | undefined;
    };

    @IsInt()
    @IsPositive()
    readonly numberOfActiveParticipants: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patients: {
            readonly [visibleStatus in PatientStatus]?: number;
        },
        vehicles: {
            readonly [vehicleType: Vehicle['vehicleType']]: number | undefined;
        },
        numberOfClients: number
    ) {
        this.patients = patients;
        this.vehicles = vehicles;
        this.numberOfActiveParticipants = numberOfClients;
    }

    static readonly create = getCreate(this);
}
