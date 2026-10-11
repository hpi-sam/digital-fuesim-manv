import { Component, effect, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import {
    EvalCriterion,
    evalCriterionCategoryNames,
    evalCriterionTypesNames,
    LogicalOperator,
} from 'fuesim-digital-shared';

interface LocalInputData {
    logicalOperator: LogicalOperator | null;
    subCriteria: (EvalCriterion | null)[];
}

@Component({
    selector: 'app-or-and-criterion-form',
    templateUrl: './or-and-criterion-form.component.html',
    styleUrls: ['./or-and-criterion-form.component.scss'],
    imports: [FormsModule],
})
export class OrAndEvalCriterionFormComponent {
    public readonly subCriteriaOut = output<(EvalCriterion | null)[]>();
    public readonly logicalOperatorOut = output<LogicalOperator | null>();

    readonly inputModel = signal<LocalInputData>({
        subCriteria: [],
        logicalOperator: null,
    });
    criterionForm = form(this.inputModel);

    constructor() {
        effect(() => {
            this.subCriteriaOut.emit(this.criterionForm.subCriteria().value());
            this.logicalOperatorOut.emit(
                this.criterionForm.logicalOperator().value()
            );
        });
    }

    public readonly evalCriterionCategoryNames = evalCriterionCategoryNames;
    public readonly evalCriterionTypesNames = evalCriterionTypesNames;
}
