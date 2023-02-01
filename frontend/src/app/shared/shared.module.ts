import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HospitalNameComponent } from './components/hospital-name/hospital-name.component';
import { PatientStatusDataFieldComponent } from './components/patient-status-displayl/patient-status-data-field/patient-status-data-field.component';
import { PatientStatusDisplayComponent } from './components/patient-status-displayl/patient-status-display/patient-status-display.component';
import { TransferPointNameComponent } from './components/transfer-point-name/transfer-point-name.component';
import { ViewportNameComponent } from './components/viewport-name/viewport-name.component';
import { AppSaveOnTypingDirective } from './directives/app-save-on-typing.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { LetDirective } from './directives/let.directive';
import { FormatDurationPipe } from './pipes/format-duration.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { AppTrackByPropertyPipe } from './pipes/track-by-property/app-track-by-property.pipe';
import { ValuesPipe } from './pipes/values.pipe';
import { DisplayValidationComponent } from './validation/display-validation/display-validation.component';
import { ExactMatchValidatorDirective } from './validation/exact-match-validator.directive';
import { ExerciseExistsValidatorDirective } from './validation/exercise-exists-validator.directive';
import { ImageExistsValidatorDirective } from './validation/image-exists-validator.directive';
import { IntegerValidatorDirective } from './validation/integer-validator.directive';
import { UrlValidatorDirective } from './validation/url-validator.directive';
import { PatientStatusBadgeComponent } from './components/patient-status-badge/patient-status-badge.component';
import { OrderByPipe } from './pipes/order-by.pipe';
import { FileInputDirective } from './directives/file-input.directive';
import { JoinIdDirective } from './validation/join-id-validator.directive';
import { PersonnelNamePipe } from './pipes/personnel-name.pipe';
import { CaterCapacityCountPipe } from './pipes/cater-capacity-count.pipe';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
    declarations: [
        AutofocusDirective,
        AppSaveOnTypingDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
        JoinIdDirective,
        AppTrackByPropertyPipe,
        ExerciseExistsValidatorDirective,
        ImageExistsValidatorDirective,
        TransferPointNameComponent,
        PatientStatusDisplayComponent,
        HospitalNameComponent,
        FormatDurationPipe,
        LetDirective,
        UrlValidatorDirective,
        ValuesPipe,
        KeysPipe,
        OrderByPipe,
        ViewportNameComponent,
        IntegerValidatorDirective,
        PatientStatusDataFieldComponent,
        PatientStatusBadgeComponent,
        PersonnelNamePipe,
        CaterCapacityCountPipe,
        FileInputDirective,
        FooterComponent,
    ],
    imports: [CommonModule, RouterModule],
    exports: [
        AutofocusDirective,
        AppSaveOnTypingDirective,
        DisplayValidationComponent,
        ExactMatchValidatorDirective,
        JoinIdDirective,
        AppTrackByPropertyPipe,
        ExerciseExistsValidatorDirective,
        ImageExistsValidatorDirective,
        TransferPointNameComponent,
        PatientStatusDisplayComponent,
        HospitalNameComponent,
        FormatDurationPipe,
        LetDirective,
        UrlValidatorDirective,
        ValuesPipe,
        KeysPipe,
        OrderByPipe,
        PersonnelNamePipe,
        CaterCapacityCountPipe,
        ViewportNameComponent,
        IntegerValidatorDirective,
        PatientStatusBadgeComponent,
        FileInputDirective,
        FooterComponent,
    ],
})
export class SharedModule {}
