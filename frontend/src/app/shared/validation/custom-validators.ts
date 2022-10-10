import type { AbstractControl } from '@angular/forms';
import { isURL } from 'class-validator';
import { escapeRegExp } from 'lodash-es';

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
    export function joinUrlOrIdValidator() {
        const joinUrl = new RegExp(
            `^${escapeRegExp(location.origin)}/exercises/\\d{6,8}$`,
            'u'
        );
        const id = /^\d{6,8}$/u;
        return (control: AbstractControl) =>
            !control.value ||
            id.test(control.value) ||
            joinUrl.test(control.value)
                ? null
                : { joinUrlOrId: true as const };
    }
}
