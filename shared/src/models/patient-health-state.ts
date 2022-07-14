import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import type { UUID } from '../utils';
import { getCreate, PatientStatus } from './utils';
import { PretriageInformation } from './utils/pretriage-information';

/**
 * If all conditions apply the patient should switch to the next state
 * if a condition is undefined it is ignored
 */
export class ConditionParameters {
    /**
     * How long the patient is in the current state already
     */
    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly earliestTime?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly latestTime?: number;

    @IsOptional()
    @IsBoolean()
    public readonly isBeingTreated?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly requiredMaterialAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly requiredNotArztAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly requiredNotSanAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly requiredRettSanAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly requiredSanAmount?: number;
    /**
     * The id of the patients healthState to switch to when all the conditions match
     */
    @IsString()
    public readonly matchingHealthStateId: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        earliestTime: number | undefined,
        latestTime: number | undefined,
        isBeingTreated: boolean | undefined,
        requiredMaterialAmount: number | undefined,
        requiredNotArztAmount: number | undefined,
        requiredNotSanAmount: number | undefined,
        requiredRettSanAmount: number | undefined,
        requiredSanAmount: number | undefined,
        matchingHealthStateId: UUID
    ) {
        this.earliestTime = earliestTime;
        this.latestTime = latestTime;
        this.isBeingTreated = isBeingTreated;
        this.requiredMaterialAmount = requiredMaterialAmount;
        this.requiredNotArztAmount = requiredNotArztAmount;
        this.requiredNotSanAmount = requiredNotSanAmount;
        this.requiredRettSanAmount = requiredRettSanAmount;
        this.requiredSanAmount = requiredSanAmount;
        this.matchingHealthStateId = matchingHealthStateId;
    }

    static readonly create = getCreate(this);
}

export class PatientHealthState {
    @IsString()
    public readonly id: string;

    @ValidateNested()
    @Type(() => PretriageInformation)
    public readonly pretriageInformation: PretriageInformation;

    @IsString()
    public readonly status: PatientStatus;

    /**
     * The first matching conditions are selected.
     * When nothing matches, the state is not changed.
     */
    @Type(() => ConditionParameters)
    @ValidateNested({ each: true })
    public readonly nextStateConditions: readonly ConditionParameters[];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: string,
        pretriageInformation: PretriageInformation,
        status: PatientStatus,
        nextStateConditions: readonly ConditionParameters[]
    ) {
        this.id = id;
        this.pretriageInformation = pretriageInformation;
        this.status = status;
        this.nextStateConditions = nextStateConditions;
    }

    static readonly create = getCreate(this);
}
