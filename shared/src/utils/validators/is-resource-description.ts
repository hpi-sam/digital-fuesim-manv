import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { min, isString, isInt } from 'class-validator';
import { StrictObject } from '../strict-object';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export type ResourceDescription<K extends string = string> = {
    [key in K]: number;
};

export const isResourceDescription = createMapValidator<string, number>({
    keyValidator: isString,
    valueValidator: (value): value is number => isInt(value) && min(value, 0),
});

export const addResourceDescription = createCombine((a, b) => a + b);

export const greaterEqualResourceDescription = createCompare((a, b) => a >= b);

export function createCombine(fn: (a: number, b: number) => number) {
    return <K extends string>(
        a: ResourceDescription<K>,
        b: ResourceDescription<K>
    ) =>
        Object.fromEntries(
            StrictObject.keys(a).map((k) => [k, fn(a[k], b[k])])
        ) as ResourceDescription<K>;
}

export function createCompare(fn: (a: number, b: number) => boolean) {
    return <K extends string>(
        a: ResourceDescription<K>,
        b: ResourceDescription<K>
    ) => StrictObject.keys(a).every((k) => fn(a[k], b[k]));
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsResourceDescription<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ [key: string]: number }, Each> {
    return makeValidator<{ [key: string]: number }, Each>(
        'isResourceDescription',
        (value: unknown, args?: ValidationArguments) =>
            isResourceDescription(value),
        validationOptions
    );
}
