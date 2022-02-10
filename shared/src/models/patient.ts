import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { PatientStatus } from './utils';
import { Position } from './utils';

export class Patient {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    // TODO: any can't be validated
    public personalInformation: any;

    // TODO
    public visibleStatus: PatientStatus | null;

    // TODO
    public realStatus: PatientStatus;

    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        personalInformation: any,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
    }

    /**
     * Exclusive-or to {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public position?: Position;
    /**
     * Exclusive-or to {@link position}
     */
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public vehicleId?: UUID;

    /**
     * The time the patient already is in the current state
     */
    stateTime = 0;

    healthStates: { [stateId: UUID]: PatientHealthState } = {};
    /**
     * The id of the current health state in {@link healthStates}
     */
    currentHealthStateId!: UUID;

    /**
     * 100_000 healthPoints is the maximum
     * 0 healthPoints is the minimum
     * === 0 healthPoints is black
     * > 0 and <= 33_000 healthPoints is red
     * > 33_000 and <= 66_000 healthPoints is yellow
     * > 66_000 healthPoints is green
     */
    health = 100_000;
    /**
     * Wether the patient is currently being treated by a personnel
     */
    isBeingTreated = false;
    /**
     * The speed with which the patients healtStatus changes
     * if it is 0.5 every patient changes half as fast (slow motion)
     */
    timeSpeed = 1;
}

export interface PatientHealthState {
    id: UUID;
    functionParameters: FunctionParameters;
    /**
     * The first matching conditions are selected.
     * When nothing matches, the state is not changed.
     */
    nextStateConditions: ConditionParameters[];
}

/**
 * These parameters determine the increase or decrease of a patients health every second
 */
export interface FunctionParameters {
    /**
     * Every second the health points are increased by this value
     */
    constantChange: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notarzt personnel
     */
    notarztModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of retSan personnel
     */
    retSanModifier: number;
    /**
     * Every second the health points are increased by this value multiplied by the weighted number of notSan personnel
     */
    notSanModifier: number;
}

/**
 * If all conditions apply the patient should switch to the next state
 * if a condition is undefined it is ignored
 */
export interface ConditionParameters {
    /**
     * How long the patient is in the current state already
     */
    earliestTime: number | undefined;
    latestTime: number | undefined;
    minimumHealth: number | undefined;
    maximumHealth: number | undefined;
    isBeingTreated: boolean | undefined;
    /**
     * The id of the patients healthState to switch to when all the conditions match
     */
    matchingHealthStateId: UUID;
}
