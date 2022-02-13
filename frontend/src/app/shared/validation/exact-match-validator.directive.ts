import { Directive, Input } from '@angular/core';
import type { AbstractControl, Validator } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
    selector: '[appExactMatchValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: ExactMatchValidatorDirective,
            multi: true,
        },
    ],
})
export class ExactMatchValidatorDirective implements Validator {
    /**
     * The string to match
     */
    @Input() appExactMatchValidator!: string;

    validate(control: AbstractControl) {
        const stringToMatch = this.appExactMatchValidator;
        return CustomValidators.exactMatchValidator(stringToMatch)(control);
    }
}
