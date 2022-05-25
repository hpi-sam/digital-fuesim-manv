import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofocusDirective } from './directives/autofocus.directive';
import { DisplayValidationComponent } from './validation/display-validation/display-validation.component';
import { ExactMatchValidatorDirective } from './validation/exact-match-validator.directive';
import { OnlyNumbersValidatorDirective } from './validation/only-numbers-validator.directive';
import { AppTrackByPropertyPipe } from './pipes/track-by-property/app-track-by-property.pipe';
import { ExerciseExistsValidatorDirective } from './validation/exercise-exists-validator.directive';
import { ImageExistsValidatorDirective } from './validation/image-exists-validator.directive';
import { TransferPointNameComponent } from './components/transfer-point-name/transfer-point-name.component';
import { HospitalNameComponent } from './components/hospital-name/hospital-name.component';
import { FormatDurationPipe } from './pipes/format-duration.pipe';
import { LetDirective } from './directives/let.directive';
import { UrlValidatorDirective } from './validation/url-validator.directive';
import { ValuesPipe } from './pipes/values.pipe';
import { ViewportNameComponent } from './components/viewport-name/viewport-name.component';
import { IntegerValidatorDirective } from './validation/integer-validator.directive';

@NgModule({
    declarations: [
        AutofocusDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
        OnlyNumbersValidatorDirective,
        AppTrackByPropertyPipe,
        ExerciseExistsValidatorDirective,
        ImageExistsValidatorDirective,
        TransferPointNameComponent,
        HospitalNameComponent,
        FormatDurationPipe,
        LetDirective,
        UrlValidatorDirective,
        ValuesPipe,
        ViewportNameComponent,
        IntegerValidatorDirective,
    ],
    imports: [CommonModule],
    exports: [
        AutofocusDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
        OnlyNumbersValidatorDirective,
        AppTrackByPropertyPipe,
        ExerciseExistsValidatorDirective,
        ImageExistsValidatorDirective,
        TransferPointNameComponent,
        HospitalNameComponent,
        FormatDurationPipe,
        LetDirective,
        UrlValidatorDirective,
        ValuesPipe,
        ViewportNameComponent,
        IntegerValidatorDirective,
    ],
})
export class SharedModule {}
