import { Component, effect, output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
    evalCriterionCategoryNames,
    UUID,
    evalCriterionTypesNames,
    ComparativeOperator,
} from 'fuesim-digital-shared';

interface LocalInputData {
    leftChild: UUID | null;
    rightChild: UUID | null;
    operator: ComparativeOperator | null;
}

@Component({
    selector: 'app-compare-criterion-form',
    templateUrl: './compare-criterion-form.component.html',
    styleUrls: ['./compare-criterion-form.component.scss'],
    imports: [],
})
export class CompareEvalCriterionFormComponent {
    public readonly leftChildOut = output<UUID | null>();
    public readonly rightChildOut = output<UUID | null>();
    public readonly operatorOut = output<ComparativeOperator | null>();

    public readonly evalCriterionCategoryNames = evalCriterionCategoryNames;
    public readonly evalCriterionTypesNames = evalCriterionTypesNames;

    readonly inputModel = signal<LocalInputData>({
        leftChild: null,
        rightChild: null,
        operator: null,
    });
    criterionForm = form(this.inputModel);

    constructor() {
        effect(() => {
            this.leftChildOut.emit(this.criterionForm.leftChild().value());
            this.rightChildOut.emit(this.criterionForm.rightChild().value());
            this.operatorOut.emit(this.criterionForm.operator().value());
        });
    }
}
