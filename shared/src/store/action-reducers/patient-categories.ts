import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { isEqual, unionWith } from 'lodash-es';
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
                draftState.patientCategories = unionWith(
                    draftState.patientCategories,
                    cloneDeepMutable(patientCategories),
                    (category1, category2) =>
                        isEqual(category1.name, category2.name)
                );

                // const newPatientCategories: PatientCategory[] = [];
                // cloneDeepMutable(patientCategories).forEach((addedCategory) => {
                //     const currentCategory = draftState.patientCategories.find(
                //         (existingCategory) =>
                //             isEqual(addedCategory.name, existingCategory.name)
                //     );
                //     if (currentCategory) {
                //         addedCategory.patientTemplates.forEach((template) => {
                //             currentCategory!.patientTemplates.push(template);
                //         });
                //         newPatientCategories.push(currentCategory);
                //     } else {
                //         newPatientCategories.push(addedCategory);
                //     }
                // });
                // draftState.patientCategories = newPatientCategories;

                return draftState;
            },
            rights: 'trainer',
        };
}
