import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { IsValue } from '../utils/validators';
import { getCreate, HealthPoints, IsValidHealthPoint } from './utils';

/**
 * These parameters determine the increase or decrease of a patients health every second
 */
export class FunctionParameters {
    /**
     * Every second the health points are increased by this value
     */
    @IsNumber()
    public readonly constantChange: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notarzt personnel
     */
    @IsNumber()
    public readonly notarztModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notSan personnel
     */
    @IsNumber()
    public readonly notSanModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of rettSan personnel
     */
    @IsNumber()
    public readonly rettSanModifier: number;

    // TODO: sanModifier not included

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        constantChange: number,
        notarztModifier: number,
        notSanModifier: number,
        rettSanModifier: number
    ) {
        this.constantChange = constantChange;
        this.notarztModifier = notarztModifier;
        this.rettSanModifier = rettSanModifier;
        this.notSanModifier = notSanModifier;
    }

    static readonly create = getCreate(this);
}

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
    public readonly earliestTime?: number;
    @IsOptional()
    @IsNumber()
    public readonly latestTime?: number;
    @IsOptional()
    @IsValidHealthPoint()
    public readonly minimumHealth?: HealthPoints;
    @IsOptional()
    @IsValidHealthPoint()
    public readonly maximumHealth?: HealthPoints;
    @IsOptional()
    @IsBoolean()
    public readonly isBeingTreated?: boolean;
    /**
     * The id of the patients healthState to switch to when all the conditions match
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly matchingHealthStateId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        earliestTime: number | undefined,
        latestTime: number | undefined,
        minimumHealth: HealthPoints | undefined,
        maximumHealth: HealthPoints | undefined,
        isBeingTreated: boolean | undefined,
        matchingHealthStateId: UUID
    ) {
        this.earliestTime = earliestTime;
        this.latestTime = latestTime;
        this.minimumHealth = minimumHealth;
        this.maximumHealth = maximumHealth;
        this.isBeingTreated = isBeingTreated;
        this.matchingHealthStateId = matchingHealthStateId;
    }

    static readonly create = getCreate(this);
}

export class PatientHealthState {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('patientHealthState' as const)
    public readonly type = 'patientHealthState';

    @Type(() => FunctionParameters)
    @ValidateNested()
    public readonly functionParameters: FunctionParameters;

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
        functionParameters: FunctionParameters,
        nextStateConditions: readonly ConditionParameters[]
    ) {
        this.functionParameters = functionParameters;
        this.nextStateConditions = nextStateConditions;
    }

    static readonly create = getCreate(this);
}
