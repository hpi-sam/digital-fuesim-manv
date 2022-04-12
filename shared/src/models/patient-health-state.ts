import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import type { HealthPoints } from './utils';
import { getCreate, IsValidHealthPoint } from './utils';

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
     * Every second the health points are increased by this value multiplied by the weighted number of retSan personnel
     */
    @IsNumber()
    public readonly retSanModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notSan personnel
     */
    @IsNumber()
    public readonly notSanModifier: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        constantChange: number,
        notarztModifier: number,
        retSanModifier: number,
        notSanModifier: number
    ) {
        this.constantChange = constantChange;
        this.notarztModifier = notarztModifier;
        this.retSanModifier = retSanModifier;
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
    public readonly earliestTime: number | undefined;
    @IsOptional()
    @IsNumber()
    public readonly latestTime: number | undefined;
    @IsOptional()
    @IsValidHealthPoint()
    public readonly minimumHealth: HealthPoints | undefined;
    @IsOptional()
    @IsValidHealthPoint()
    public readonly maximumHealth: HealthPoints | undefined;
    @IsOptional()
    @IsBoolean()
    public readonly isBeingTreated: boolean | undefined;
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
        nextStateConditions: ConditionParameters[]
    ) {
        this.functionParameters = functionParameters;
        this.nextStateConditions = nextStateConditions;
    }

    static readonly create = getCreate(this);
}
