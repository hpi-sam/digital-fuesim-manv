import { IsInt, IsObject, Min } from 'class-validator';
import type { Vehicle } from '../vehicle';
import { getCreate } from './get-create';
import type { PatientStatus } from './patient-status';
import type { PersonnelType } from './personnel-type';

/**
 * The statistics for an area in the exercise (e.g. a viewport or the whole exercise).
 */
export class AreaStatistics {
    /**
     * The number of patients per type
     */
    @IsObject()
    readonly patients: {
        readonly [visibleStatus in PatientStatus]?: number;
    };

    /**
     * The number of vehicles (inclusive in transfer) per type.
     */
    @IsObject()
    readonly vehicles: {
        readonly [vehicleType: Vehicle['vehicleType']]: number | undefined;
    };

    /**
     * The number of disembarked personnel that is not in transfer per personnelType.
     */
    @IsObject()
    readonly personnel: {
        readonly [personnelType in PersonnelType]?: number;
    };

    @IsInt()
    @Min(0)
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
        personnel: {
            readonly [personnelType in PersonnelType]?: number;
        },
        numberOfClients: number
    ) {
        this.patients = patients;
        this.vehicles = vehicles;
        this.personnel = personnel;
        this.numberOfActiveParticipants = numberOfClients;
    }

    static readonly create = getCreate(this);
}
