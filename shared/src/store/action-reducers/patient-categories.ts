import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PatientCategory } from '../../models/patient-category';
import { cloneDeepMutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class ImportPatientCategoriesFromCSVAction implements Action {
    @IsValue('[PatientCategories] Import Patient Categories from CSV')
    public readonly type =
        '[PatientCategories] Import Patient Categories from CSV';

    @IsArray()
    @ValidateNested()
    @Type(() => PatientCategory)
    public readonly patientCategories!: readonly PatientCategory[];
}

export namespace PatientCategoriesActionReducers {
    export const importPatientCategoriesFromCSV: ActionReducer<ImportPatientCategoriesFromCSVAction> =
        {
            action: ImportPatientCategoriesFromCSVAction,
            reducer: (draftState, { patientCategories }) => {
                draftState.patientCategories =
                    cloneDeepMutable(patientCategories);
                return draftState;
            },
            rights: 'trainer',
        };
}
