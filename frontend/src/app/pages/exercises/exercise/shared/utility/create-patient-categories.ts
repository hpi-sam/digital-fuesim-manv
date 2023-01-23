import { PatientCategory } from 'digital-fuesim-manv-shared';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { PatientData } from './parse-csv';

export function createPatientCatgories(
    patientData: PatientData[],
    exerciseService: ExerciseService
) {
    const patientCategories = patientData.map(({ code, templates }) =>
        PatientCategory.create(code, templates[0]!.image, templates)
    );

    exerciseService.proposeAction({
        type: '[PatientCategories] Import Patient Categories from CSV',
        patientCategories,
    });
}
