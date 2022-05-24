import { Directive } from '@angular/core';
import type { AbstractControl, Validator } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
    selector: '[appIntegerValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: IntegerValidatorDirective,
            multi: true,
        },
    ],
})
export class IntegerValidatorDirective implements Validator {
    validate(control: AbstractControl) {
        return CustomValidators.integerValidator()(control);
    }
}
