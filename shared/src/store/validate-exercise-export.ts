import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import type { ExportImportFile } from '../export-import/file-format';
import { PartialExport, StateExport } from '../export-import/file-format';
import type { Constructor } from '../utils';
import { defaultValidateOptions } from './validation-options';

/**
 *
 * @param exportImportFile A json object that should be checked for validity.
 * @returns An array of errors validating {@link exportImportFile}. An empty array indicates a valid exportImport object.
 */
export function validateExerciseExport(
    exportImportFile: ExportImportFile
): (ValidationError | string)[] {
    // Be aware that `action` could be any json object. We need to program defensively here.
    if (typeof exportImportFile.type !== 'string') {
        return ['Export/import type is not a string.'];
    }
    const exportImportClass = { complete: StateExport, partial: PartialExport }[
        exportImportFile.type
    ];
    // if the exportImportFile.type is not a valid exportImportClass type, the exportImportClass is undefined.
    if (!exportImportClass) {
        return [`Unknown export/import type: ${exportImportFile.type}`];
    }

    // This works - no idea about the type error though...
    const validationErrors: (ValidationError | string)[] = validateSync(
        plainToInstance(
            exportImportClass as Constructor<ExportImportFile>,
            exportImportFile
        ),
        defaultValidateOptions
    );
    return validationErrors;
}
