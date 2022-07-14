import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { PatientCategory } from '../../models/patient-category';
import { cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';

export class ImportPatientCategoriesFromCSVAction implements Action {
    @IsString()
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
