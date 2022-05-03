import type { AbstractControl } from '@angular/forms';
import isUrl from 'validator/lib/isURL';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomValidators {
    export function exactMatchValidator(stringToMatch: string) {
        return (control: AbstractControl) =>
            stringToMatch !== control.value
                ? { exactMatch: { value: control.value, stringToMatch } }
                : null;
    }
    export function onlyNumbersValidator() {
        return (control: AbstractControl) =>
            /^\d*$/u.test(control.value)
                ? null
                : { onlyNumbers: true as const };
    }
    export function urlValidator() {
        return (control: AbstractControl) =>
            !control.value || isUrl(control.value)
                ? null
                : { url: true as const };
    }
}
