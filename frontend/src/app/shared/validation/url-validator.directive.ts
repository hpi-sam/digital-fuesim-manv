import { Directive } from '@angular/core';
import type { AbstractControl, Validator } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
    selector: '[appUrlValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: UrlValidatorDirective,
            multi: true,
        },
    ],
})
export class UrlValidatorDirective implements Validator {
    validate(control: AbstractControl) {
        return CustomValidators.urlValidator()(control);
    }
}
