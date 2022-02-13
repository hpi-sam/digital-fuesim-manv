import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofocusDirective } from './directives/autofocus.directive';
import { DisplayValidationComponent } from './validation/display-validation/display-validation.component';
import { ExactMatchValidatorDirective } from './validation/exact-match-validator.directive';

@NgModule({
    declarations: [
        AutofocusDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
    ],
    imports: [CommonModule],
    exports: [
        AutofocusDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
    ],
})
export class SharedModule {}
