import { Directive, Input } from '@angular/core';
import type {
    AbstractControl,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';

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

    validate(control: AbstractControl): ValidationErrors | null {
        const stringToMatch = this.appExactMatchValidator;
        return stringToMatch !== control.value
            ? { exactMatch: { value: control.value, stringToMatch } }
            : null;
    }
}
