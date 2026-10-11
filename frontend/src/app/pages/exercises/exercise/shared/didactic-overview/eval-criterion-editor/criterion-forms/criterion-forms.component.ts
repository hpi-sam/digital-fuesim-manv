import {
    Component,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import {
    EvalCriterion,
    EvalCriterionCategory,
    EvalCriterionType,
    evalCriterionTypesNames,
    EvalResult,
    Patient,
    Scoutable,
    TechnicalChallenge,
    UUID,
} from 'fuesim-digital-shared';
import { InputData } from '../input-data';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { AppSaveOnTypingDirective } from '../../../../../../../shared/directives/app-save-on-typing.directive';
import { PatientAtStatusCriterionFormComponent } from './patient-at-status-criterion/patient-at-status-criterion-form.component';
import { CountPatientsAtStatusCriterionFormComponent } from './count-patients-at-status-criterion/count-patients-at-status-criterion-form.component';
import { ReachTechnicalChallengeStateEvalCriterionFormComponent } from './reach-technical-challenge-state-criterion/reach-technical-challenge-state-criterion-form.component';
import { ViewScoutableEvalCriterionFormComponent } from './view-scoutable-criterion/view-scoutable-criterion-form.component';
import { CountMeasuresCriterionFormComponent } from './do-measure-x-times-criterion/count-measures-criterion-form.component';
import { ConstNumEvalCriterionFormComponent } from './const-num-criterion/const-num-criterion-form.component';
import { OrAndEvalCriterionFormComponent } from './or-and-criterion/or-and-criterion-form.component';
import { CountCompletedEvalCriterionFormComponent } from './count-completed-criterion/count-completed-criterion-form.component';
import { FristTrueAtEvalCriterionFormComponent } from './first-true-at-criterion/first-true-at-criterion-form.component';
import { NotEvalCriterionFormComponent } from './not-criterion/not-criterion-form.component';
import { TimestampEvalCriterionFormComponent } from './timestamp-criterion/timestamp-criterion-form.component';
import { CompareEvalCriterionFormComponent } from './greater-than-criterion/compare-criterion-form.component';

@Component({
    selector: 'app-eval-criterion-forms',
    templateUrl: './criterion-forms.component.html',
    styleUrls: ['./criterion-forms.component.scss'],
    imports: [
        FormsModule,
        FormField,
        AppSaveOnTypingDirective,
        PatientAtStatusCriterionFormComponent,
        CountPatientsAtStatusCriterionFormComponent,
        ReachTechnicalChallengeStateEvalCriterionFormComponent,
        ViewScoutableEvalCriterionFormComponent,
        CountMeasuresCriterionFormComponent,
        ConstNumEvalCriterionFormComponent,
        OrAndEvalCriterionFormComponent,
        CountCompletedEvalCriterionFormComponent,
        FristTrueAtEvalCriterionFormComponent,
        NotEvalCriterionFormComponent,
        TimestampEvalCriterionFormComponent,
        CompareEvalCriterionFormComponent,
    ],
})
export class EvalCriterionFormsComponent {
    public readonly evalCriterionTypesNames = evalCriterionTypesNames;

    readonly criterionFormOut = output<FieldTree<InputData, string | number>>();

    constructor() {
        effect(() => {
            this.criterionFormOut.emit(this.criterionForm);
        });
    }

    public readonly currentCriterion = input<EvalCriterion>();
    /* TODO @JohannesPotzi : prune this for sub criteria selection to prevent circular input. */
    public readonly criteriaIn = input.required<{
        [id: UUID]: EvalCriterion;
    }>();
    public readonly resultsIn = input.required<{
        [critId: UUID]: EvalResult;
    }>();
    public readonly technichalChallengesIn = input.required<{
        [id: UUID]: TechnicalChallenge;
    }>();
    public readonly scoutablesIn = input.required<{ [id: UUID]: Scoutable }>();
    public readonly patientsIn = input.required<{ [id: UUID]: Patient }>();
    public readonly criterionCreationCategory =
        input.required<EvalCriterionCategory | null>();

    public readonly criterionCreationType =
        input.required<EvalCriterionType | null>();

    public readonly criterionCreationTypeName = computed(() => {
        const selectedType = this.criterionCreationType();
        return selectedType ? this.evalCriterionTypesNames[selectedType] : '';
    });

    readonly inputModel = signal<InputData>({
        name: '',
        countInput: 0,
        comparativeOperator: 'lessThanOrEqual',
        logicalOperator: 'and',
        timestampInput: 0,
        patientStatusInput: 'black',
        targetMeasureTemplateId: '',
        technicalChallengeId: '',
        targetStateMachineIds: [],
        targetStateMachineStateIds: {},
        targetPatients: [],
        targetPatientsStatusMap: {},
        targetScoutableId: '',
        subCriteria: [],
        singleSubCriterion: '',
    });
    criterionForm = form(this.inputModel);

    public pushSubCriteria(criteriaIds: UUID[]) {
        const criteria = criteriaIds
            .map((id) => this.criteriaIn()[id])
            .filter((val) => val !== undefined);
        this.criterionForm.subCriteria().value.update((val) => {
            return [...val, ...criteria];
        });
    }
}
