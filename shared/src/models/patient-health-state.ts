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
import { IsValidHealthPoint } from './utils';

/**
 * These parameters determine the increase or decrease of a patients health every second
 */
export class FunctionParameters {
    /**
     * Every second the health points are increased by this value
     */
    @IsNumber()
    constantChange: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notarzt personnel
     */
    @IsNumber()
    notarztModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of retSan personnel
     */
    @IsNumber()
    retSanModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notSan personnel
     */
    @IsNumber()
    notSanModifier: number;

    private constructor(
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

    static create(
        constantChange: number,
        notarztModifier: number,
        retSanModifier: number,
        notSanModifier: number
    ) {
        return {
            ...new FunctionParameters(
                constantChange,
                notarztModifier,
                retSanModifier,
                notSanModifier
            ),
        };
    }
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
    earliestTime: number | undefined;
    @IsOptional()
    @IsNumber()
    latestTime: number | undefined;
    @IsOptional()
    @IsValidHealthPoint()
    minimumHealth: HealthPoints | undefined;
    @IsOptional()
    @IsValidHealthPoint()
    maximumHealth: HealthPoints | undefined;
    @IsOptional()
    @IsBoolean()
    isBeingTreated: boolean | undefined;
    /**
     * The id of the patients healthState to switch to when all the conditions match
     */
    @IsUUID(4, uuidValidationOptions)
    matchingHealthStateId: UUID;

    private constructor(
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

    static create(
        earliestTime: number | undefined,
        latestTime: number | undefined,
        minimumHealth: HealthPoints | undefined,
        maximumHealth: HealthPoints | undefined,
        isBeingTreated: boolean | undefined,
        matchingHealthStateId: UUID
    ) {
        return {
            ...new ConditionParameters(
                earliestTime,
                latestTime,
                minimumHealth,
                maximumHealth,
                isBeingTreated,
                matchingHealthStateId
            ),
        };
    }
}

export class PatientHealthState {
    @IsUUID(4, uuidValidationOptions)
    id: UUID = uuid();

    @Type(() => FunctionParameters)
    @ValidateNested()
    functionParameters: FunctionParameters;

    @Type(() => ConditionParameters)
    @ValidateNested({ each: true })
    /**
     * The first matching conditions are selected.
     * When nothing matches, the state is not changed.
     */
    nextStateConditions: ConditionParameters[];

    private constructor(
        functionParameters: FunctionParameters,
        nextStateConditions: ConditionParameters[]
    ) {
        this.functionParameters = functionParameters;
        this.nextStateConditions = nextStateConditions;
    }

    static create(
        functionParameters: FunctionParameters,
        nextStateConditions: ConditionParameters[]
    ) {
        return {
            ...new PatientHealthState(functionParameters, nextStateConditions),
        };
    }
}
