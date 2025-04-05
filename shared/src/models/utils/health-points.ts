import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isNumber, registerDecorator } from 'class-validator';
import type { PatientStatus } from './patient-status';

/**
 * `100_000` healthPoints is the maximum;
 * `0` healthPoints is the minimum;
 * `=== 0` healthPoints is black;
 * `> 0` and `<= 33_000` healthPoints is red;
 * `> 33_000` and `<= 66_000` healthPoints is yellow;
 * `> 66_000` healthPoints is green
 */
export type HealthPoints = number;

export const healthPointsDefaults = {
    max: 100_000,
    min: 0,
    greenMax: 100_000,
    greenAverage: 85_000,
    yellowMax: 66_000,
    yellowAverage: 50_000,
    redMax: 33_000,
    redAverage: 20_000,
    blackMax: 0,
};

export function getStatus(health: HealthPoints): PatientStatus {
    if (health <= healthPointsDefaults.blackMax) {
        return 'black';
    }
    if (health <= healthPointsDefaults.redMax) {
        return 'red';
    }
    if (health <= healthPointsDefaults.yellowMax) {
        return 'yellow';
    }
    return 'green';
}

export function isValidHealthPoint(health: HealthPoints) {
    return (
        health >= healthPointsDefaults.min && health <= healthPointsDefaults.max
    );
}

export function isGreen(health: HealthPoints) {
    return (
        health > healthPointsDefaults.yellowMax &&
        health <= healthPointsDefaults.greenMax
    );
}

export function isYellow(health: HealthPoints) {
    return (
        health > healthPointsDefaults.redMax &&
        health <= healthPointsDefaults.yellowMax
    );
}

export function isRed(health: HealthPoints) {
    return (
        health > healthPointsDefaults.blackMax &&
        health <= healthPointsDefaults.redMax
    );
}

export function isBlack(health: HealthPoints) {
    return (
        health >= healthPointsDefaults.min &&
        health <= healthPointsDefaults.blackMax
    );
}

export function isAlive(health: HealthPoints) {
    return (
        health > healthPointsDefaults.blackMax &&
        health <= healthPointsDefaults.greenMax
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsValidHealthPoint(validationOptions?: ValidationOptions) {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidHealthpoint',
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    'Value must be a correct health point',
                ...validationOptions,
            },
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return isNumber(value) && isValidHealthPoint(value);
                },
            },
        });
    };
}
