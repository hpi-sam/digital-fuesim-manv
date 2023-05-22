import type { AbstractControl } from '@angular/forms';
import { isURL } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomValidators {
    export function exactMatchValidator(stringToMatch: string) {
        return (control: AbstractControl) =>
            stringToMatch !== control.value
                ? { exactMatch: { value: control.value, stringToMatch } }
                : null;
    }
    export function urlValidator() {
        return (control: AbstractControl) =>
            !control.value || isURL(control.value)
                ? null
                : { url: true as const };
    }
    export function integerValidator() {
        return (control: AbstractControl) =>
            !control.value || Number.isInteger(control.value)
                ? null
                : { integer: true as const };
    }
    export function joinIdValidator() {
        return (control: AbstractControl) =>
            /^((\d{6})|(\d{8}))$/u.test(control.value)
                ? null
                : { joinId: true as const };
    }
    export function geographicCoordinateValidator() {
        return (control: AbstractControl) =>
            /^-?\d{1,3}(.\d+)?$/u.test(control.value)
                ? null
                : { geographicCoordinate: true as const };
    }
}
