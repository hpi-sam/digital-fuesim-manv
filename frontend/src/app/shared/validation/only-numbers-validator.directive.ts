import { Directive } from '@angular/core';
import type { AbstractControl, Validator } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
    selector: '[appOnlyNumbersValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: OnlyNumbersValidatorDirective,
            multi: true,
        },
    ],
})
export class OnlyNumbersValidatorDirective implements Validator {
    validate(control: AbstractControl) {
        return CustomValidators.onlyNumbersValidator()(control);
    }
}
