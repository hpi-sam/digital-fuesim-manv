import { ValidationArguments, ValidationOptions } from 'class-validator';
import { v4 } from 'uuid';

/**
 * Generates a v4 uuid
 */
export function uuid(): UUID {
    // this is an extra function to make the imports easier (no `v4 as uuid` that can't be auto-generated)
    return v4();
}

export type UUID = string;


const UUIDValidationFailedWithId: ((id: string) => string) = (id: string) => `Got malformed id: '${id}'.`
const UUIDValidationFailedMessage: ((validationArguments: ValidationArguments) => string) = (validationArguments: ValidationArguments) => UUIDValidationFailedWithId(String(validationArguments.value))
export const UUIDValidationOptions: ValidationOptions = {
  message: UUIDValidationFailedMessage,
}
export const UUIDArrayValidationOptions: ValidationOptions = {
  ...UUIDValidationOptions,
  each: true,
}
