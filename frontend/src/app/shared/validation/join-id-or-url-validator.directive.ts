import { Directive } from '@angular/core';
import type { AbstractControl, Validator } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
    selector: '[appJoinUrlOrIdValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: JoinIdOrUrlDirective,
            multi: true,
        },
    ],
})
export class JoinIdOrUrlDirective implements Validator {
    validate(control: AbstractControl) {
        return CustomValidators.joinUrlOrIdValidator()(control);
    }
}
