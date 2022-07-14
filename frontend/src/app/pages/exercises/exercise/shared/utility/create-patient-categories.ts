import { PatientCategory } from 'digital-fuesim-manv-shared';
import type { ApiService } from 'src/app/core/api.service';
import type { PatientData } from './parse-csv';

export function createPatientCatgories(
    patientData: PatientData[],
    apiService: ApiService
) {
    const patientCategories: PatientCategory[] = [];

    patientData.forEach(({ code, templates }) =>
        patientCategories.push(
            PatientCategory.create(code, templates[0].image, templates)
        )
    );

    apiService.proposeAction({
        type: '[PatientCategories] Import Patient Categories from CSV',
        patientCategories,
    });
}
