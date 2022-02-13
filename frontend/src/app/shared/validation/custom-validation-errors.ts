import type { CustomValidators } from './custom-validators';

/**
 * A strongly typed version of the ValidationErrors interface.
 */
export type CustomValidationErrors = Partial<
    UnionToIntersection<
        AngularValidationErrors | Exclude<CustomValidationError, null>
    >
>;

type CustomValidator = typeof CustomValidators[keyof typeof CustomValidators];
type CustomValidatorFn = ReturnType<CustomValidator>;
type CustomValidationError = ReturnType<CustomValidatorFn>;

/**
 * The error types of the custom validation errors already implemented by angular
 */
interface AngularValidationErrors {
    pattern: { requiredPattern: string; actualValue: string };
    minlength: { actualLength: number; requiredLength: number };
    maxlength: { actualLength: number; requiredLength: number };
    email: true;
    min: { actual: number; min: number };
    max: { actual: number; max: number };
    required: true;
}

// Utility types
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;
