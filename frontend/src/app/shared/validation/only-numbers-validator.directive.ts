import { Directive, Input } from '@angular/core';
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
    /**
     * The string to match
     */
    @Input() appOnlyNumbersValidator!: true;

    validate(control: AbstractControl) {
        return CustomValidators.onlyNumbersValidator()(control);
    }
}
