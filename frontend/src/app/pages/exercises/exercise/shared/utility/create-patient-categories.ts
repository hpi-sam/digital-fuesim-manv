import { PatientCategory } from 'digital-fuesim-manv-shared';
import type { ApiService } from 'src/app/core/api.service';
import type { PatientData } from './parse-csv';

export function createPatientCatgories(
    patientData: PatientData[],
    apiService: ApiService
) {
    const patientCategories = patientData.map(({ code, templates }) =>
        PatientCategory.create(code, templates[0]!.image, templates)
    );

    apiService.proposeAction({
        type: '[PatientCategories] Import Patient Categories from CSV',
        patientCategories,
    });
}
