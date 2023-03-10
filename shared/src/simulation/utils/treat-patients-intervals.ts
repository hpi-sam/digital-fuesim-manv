import { IsInt, Min } from 'class-validator';
import { getCreate } from '../../models/utils';

export class TreatPatientsIntervals {
    /**
     * How frequent reassignments should occur when the personnel just arrived and the situation in unclear
     */
    @IsInt()
    @Min(0)
    public readonly unknown: number;

    /**
     * How frequent reassignments should occur when the patients have been counted
     */
    @IsInt()
    @Min(0)
    public readonly counted: number;

    /**
     * How frequent reassignments should occur when all patients are triaged
     */
    @IsInt()
    @Min(0)
    public readonly triaged: number;

    /**
     * How frequent reassignments should occur when there is enough personnel to fulfil each patient's treatment needs
     */
    @IsInt()
    @Min(0)
    public readonly secured: number;

    /**
     * How long counting each patient should take.
     * Counting will be finished after {patient count} times this value.
     */
    @IsInt()
    @Min(0)
    public readonly countingTimePerPatient: number;

    constructor(
        unknown: number,
        counted: number,
        triaged: number,
        secured: number,
        countingTimePerPatient: number
    ) {
        this.unknown = unknown;
        this.counted = counted;
        this.triaged = triaged;
        this.secured = secured;
        this.countingTimePerPatient = countingTimePerPatient;
    }

    static readonly create = getCreate(this);
}
