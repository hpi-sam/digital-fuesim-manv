import { LogEntry } from '../../../models/log-entry';
import type { ExerciseRadiogram } from '../../../models/radiogram';
import type { Tag } from '../../../models/tag';
import { personnelTypeNames } from '../../../models/utils/personnel-type';
import { statusNames } from '../../../models/utils/patient-status';
import {
    createPatientStatusTag,
    createPatientTag,
    createRadiogramTypeTag,
    createSimulatedRegionTag,
    createTransferPointTag,
    createTreatmentProgressTag,
} from '../../../models/utils/tag-helpers';
import { treatmentProgressToGermanNameDictionary } from '../../../simulation/utils/treatment';
import type { ExerciseState } from '../../../state';
import type { UUID } from '../../../utils';
import { StrictObject } from '../../../utils';
import type { Mutable } from '../../../utils/immutability';
import { getElement, getExerciseRadiogramById } from './get-element';

export function logPatient(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    patientId: UUID
) {
    if (!logActive(state)) return;

    const patient = getElement(state, 'patient', patientId);

    state.logEntries!.push(
        new LogEntry(
            description,
            [
                ...additionalTags,
                createPatientTag(state, patient.id),
                createPatientStatusTag(state, patient.pretriageStatus),
            ],
            state.currentTime
        )
    );
}

export function logRadiogram(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    radiogramId: UUID
) {
    if (!logActive(state)) return;

    const radiogram = getExerciseRadiogramById(state, radiogramId);

    state.logEntries!.push(
        new LogEntry(
            `${description} ${createRadiogramDescription(state, radiogram)}`,
            [
                ...additionalTags,
                ...createTagsForRadiogramType(state, radiogram),
                createRadiogramTypeTag(state, radiogramId),
                createSimulatedRegionTag(state, radiogram.simulatedRegionId),
            ],
            state.currentTime
        )
    );
}

function createTagsForRadiogramType(
    state: Mutable<ExerciseState>,
    radiogram: ExerciseRadiogram
): Tag[] {
    switch (radiogram.type) {
        case 'missingTransferConnectionRadiogram':
            return [
                createTransferPointTag(state, radiogram.targetTransferPointId),
            ];
        case 'treatmentStatusRadiogram':
            return [
                createTreatmentProgressTag(state, radiogram.treatmentStatus),
            ];
        default:
            return [];
    }
}

function createRadiogramDescription(
    state: Mutable<ExerciseState>,
    radiogram: ExerciseRadiogram
): string {
    if (!radiogram.informationAvailable) return '';

    switch (radiogram.type) {
        case 'missingTransferConnectionRadiogram': {
            const transferPoint = getElement(
                state,
                'transferPoint',
                radiogram.targetTransferPointId
            );
            return `Eine Transferverbindung zu ${transferPoint.externalName} existierte nicht.`;
        }
        case 'treatmentStatusRadiogram': {
            return `Der Behandlungsstatus war ${
                treatmentProgressToGermanNameDictionary[
                    radiogram.treatmentStatus
                ]
            }.`;
        }
        case 'materialCountRadiogram': {
            return `Es gab Materialien für die folgenden Patientenkategorien: ${generateCountString(
                {
                    red: radiogram.materialForPatients.red,
                    yellow: radiogram.materialForPatients.yellow,
                    green: radiogram.materialForPatients.green,
                },
                (status) => statusNames[status]
            )}.`;
        }
        case 'patientCountRadiogram': {
            return `Es wurden die folgenden Patientenzahlen in der Region gezählt: ${generateCountString(
                radiogram.patientCount,
                (status) => statusNames[status]
            )}.`;
        }
        case 'personnelCountRadiogram': {
            return `In dieser Region gab es die folgenden Einsatzkräfte: ${generateCountString(
                radiogram.personnelCount,
                (type) => personnelTypeNames[type]
            )}.`;
        }
        case 'resourceRequestRadiogram': {
            return `Es wurden die folgenden Resourcen angefragt: ${generateCountString(
                radiogram.requiredResource.vehicleCounts,
                (vehicleType) => vehicleType
            )}`;
        }
        case 'transferCategoryCompletedRadiogram': {
            return `Der Transport der Kategorie ${
                statusNames[radiogram.completedCategory]
            } wurde abgeshlossen`;
        }
        case 'transferCountsRadiogram': {
            return `Es wurden die folgenden Patientenzahlen ${
                radiogram.scope === 'singleRegion'
                    ? 'in dieser Region'
                    : 'in den Regionen'
            } gezählt: ${generateCountString(
                radiogram.transferredPatientsCounts,
                (status) => statusNames[status]
            )}.`;
        }
        case 'vehicleCountRadiogram': {
            return `In dieser Region gibt es die folgenden Fahrzeuge: ${generateCountString(
                radiogram.vehicleCount,
                (vehicleType) => vehicleType
            )}.`;
        }
        default:
            return '';
    }
}

function generateCountString<K extends string>(
    countsObject: { readonly [key in K]: number },
    nameOf: (key: K) => string
): string {
    return StrictObject.keys(countsObject)
        .map((status) => `${countsObject[status]} ${nameOf(status)}`)
        .join(', ');
}

function logActive(state: Mutable<ExerciseState>): boolean {
    return !!state.logEntries;
}
