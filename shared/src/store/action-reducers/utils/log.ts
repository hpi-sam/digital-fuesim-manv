import { LogEntry } from '../../../models/log-entry';
import type { ExerciseRadiogram } from '../../../models/radiogram';
import type { Tag } from '../../../models/tag';
import { personnelTypeNames } from '../../../models/utils/personnel-type';
import { statusNames } from '../../../models/utils/patient-status';
import {
    createAlarmGroupTag,
    createBehaviorTag,
    createHospitalTag,
    createPatientStatusTag,
    createPatientTag,
    createRadiogramTypeTag,
    createSimulatedRegionTag,
    createSimulatedRegionTagWithName,
    createTransferPointTag,
    createTreatmentProgressTag,
} from '../../../models/utils/tag-helpers';
import { treatmentProgressToGermanNameDictionary } from '../../../simulation/utils/treatment';
import type { ExerciseState } from '../../../state';
import type { UUID } from '../../../utils';
import { StrictObject } from '../../../utils';
import type { Mutable } from '../../../utils/immutability';
import { Patient } from '../../../models/patient';
import {
    currentSimulatedRegionOf,
    isInSimulatedRegion,
} from '../../../models/utils/position/position-helpers';
import type { WithPosition } from '../../../models/utils/position/with-position';
import type { TransferPoint } from '../../../models/transfer-point';
import type { Hospital } from '../../../models/hospital';
import type { Personnel, Vehicle } from '../../../models';
import { getElement, getExerciseRadiogramById } from './get-element';

export function log(
    state: Mutable<ExerciseState>,
    tags: Tag[],
    description: string
) {
    if (!logActive(state)) return;

    state.logEntries!.push(new LogEntry(description, tags, state.currentTime));
}

export function logAlarmGroup(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    alarmGroupId: UUID
) {
    if (!logActive(state)) return;

    log(
        state,
        [...additionalTags, createAlarmGroupTag(state, alarmGroupId)],
        description
    );
}

export function logAlarmGroupSent(
    state: Mutable<ExerciseState>,
    alarmGroupId: UUID
) {
    if (!logActive(state)) return;

    const alarmGroup = getElement(state, 'alarmGroup', alarmGroupId);

    logAlarmGroup(
        state,
        [],
        `Die Alarm Gruppe ${alarmGroup.name} wurde alarmiert`,
        alarmGroupId
    );
}

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

export function logPatientAdded(
    state: Mutable<ExerciseState>,
    patientId: UUID
) {
    if (!logActive(state)) return;

    logPatient(state, [], `Ein Patient wurde hinzugefügt.`, patientId);
}

export function logPatientRemoved(
    state: Mutable<ExerciseState>,
    patientId: UUID
) {
    if (!logActive(state)) return;

    logPatient(state, [], `Ein Patient wurde entfernt.`, patientId);
}

export function logPatientVisibleStatusChanged(
    state: Mutable<ExerciseState>,
    patientId: UUID
) {
    if (!logActive(state)) return;

    const patient = getElement(state, 'patient', patientId);

    const visibleStatus = Patient.getVisibleStatus(
        patient,
        state.configuration.pretriageEnabled,
        state.configuration.bluePatientsEnabled
    );

    logPatient(
        state,
        [createPatientStatusTag(state, visibleStatus)],
        `Ein Patient wurde als ${statusNames[visibleStatus]} gesichtet.`,
        patientId
    );
}

export function logSimulatedRegion(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    simulatedRegionId: UUID
) {
    if (!logActive(state)) return;

    log(
        state,
        [...additionalTags, createSimulatedRegionTag(state, simulatedRegionId)],
        description
    );
}

export function logSimulatedRegionNameChange(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    newName: string
) {
    if (!logActive(state)) return;

    const simulatedRegion = getElement(
        state,
        'simulatedRegion',
        simulatedRegionId
    );

    logSimulatedRegion(
        state,
        [createSimulatedRegionTagWithName(state, simulatedRegionId, newName)],
        `Der ehemalige Bereich ${simulatedRegion.name} heißt nun ${newName}`,
        simulatedRegionId
    );
}

export function logSimulatedRegionAddElement(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    elementId: string,
    elementType: 'material' | 'patient' | 'personnel' | 'vehicle'
) {
    if (!logActive(state)) return;

    switch (elementType) {
        case 'material':
            {
                logSimulatedRegion(
                    state,
                    [],
                    `Dem Bereich wurde Material hinzugefügt.`,
                    simulatedRegionId
                );
            }
            break;
        case 'patient':
            {
                const element = getElement(state, elementType, elementId);

                logSimulatedRegion(
                    state,
                    [
                        createPatientTag(state, element.id),
                        createPatientStatusTag(state, element.pretriageStatus),
                    ],
                    `Dem Bereich wurde ein Patient hinzugefügt.`,
                    simulatedRegionId
                );
            }
            break;
        case 'personnel':
            {
                const element = getElement(state, elementType, elementId);

                logSimulatedRegion(
                    state,
                    [],
                    `Dem Bereich wurde ein ${element.personnelType} hinzugefügt`,
                    simulatedRegionId
                );
            }
            break;
        case 'vehicle':
            {
                const element = getElement(state, elementType, elementId);

                logSimulatedRegion(
                    state,
                    [],
                    `Dem Bereich wurde ein ${element.vehicleType} hinzugefügt`,
                    simulatedRegionId
                );
            }
            break;
    }
}

export function logBehavior(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    simulatedRegionId: UUID,
    behaviorId: UUID
) {
    if (!logActive(state)) return;

    logSimulatedRegion(
        state,
        [
            ...additionalTags,
            createBehaviorTag(state, simulatedRegionId, behaviorId),
        ],
        description,
        simulatedRegionId
    );
}

export function logBehaviorAdded(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorId: UUID
) {
    if (!logActive(state)) return;

    const simulatedRegion = getElement(
        state,
        'simulatedRegion',
        simulatedRegionId
    );

    const behavior = simulatedRegion.behaviors.find(
        (behaviorState) => behaviorId === behaviorState.id
    )!;

    logBehavior(
        state,
        [createBehaviorTag(state, simulatedRegionId, behaviorId)],
        `Das Verhalten ${behavior.type} wurde dem Bereich ${simulatedRegion.name} hinzugefügt.`,
        simulatedRegionId,
        behaviorId
    );
}

export function logBehaviorRemoved(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorId: UUID
) {
    if (!logActive(state)) return;

    const simulatedRegion = getElement(
        state,
        'simulatedRegion',
        simulatedRegionId
    );

    const behavior = simulatedRegion.behaviors.find(
        (behaviorState) => behaviorId === behaviorState.id
    )!;

    logBehavior(
        state,
        [createBehaviorTag(state, simulatedRegionId, behaviorId)],
        `Das Verhalten ${behavior.type} wurde aus dem Bereich ${simulatedRegion.name} entfernt.`,
        simulatedRegionId,
        behaviorId
    );
}

export function logTransferPoint(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    transferPointId: UUID
) {
    if (!logActive(state)) return;

    const transferPoint = getElement(state, 'transferPoint', transferPointId);

    log(
        state,
        [
            ...additionalTags,
            isInSimulatedRegion(transferPoint)
                ? createSimulatedRegionTag(
                      state,
                      currentSimulatedRegionOf(state, transferPoint).id
                  )
                : createTransferPointTag(state, transferPointId),
        ],
        description
    );
}

export function logTransferPointConnection(
    state: Mutable<ExerciseState>,
    transferSourceId: UUID,
    transferTargetId: UUID,
    transferTargetType: 'hospital' | 'transferPoint'
) {
    if (!logActive(state)) return;

    const source = getElement(state, 'transferPoint', transferSourceId);
    const target = getElement(state, transferTargetType, transferTargetId);

    logTransferPoint(
        state,
        [
            transferTargetType === 'transferPoint'
                ? isInSimulatedRegion(target as WithPosition)
                    ? createSimulatedRegionTag(
                          state,
                          currentSimulatedRegionOf(
                              state,
                              target as WithPosition
                          ).id
                      )
                    : createTransferPointTag(state, transferTargetId)
                : createHospitalTag(state, transferTargetId),
        ],
        `Es wurde ein Transfer von ${source.externalName} nach ${
            transferTargetType === 'transferPoint'
                ? (target as TransferPoint).externalName
                : (target as Hospital).name
        } eingerichtet.`,
        transferSourceId
    );
}

export function logTransferPointConnectionRemoved(
    state: Mutable<ExerciseState>,
    transferSourceId: UUID,
    transferTargetId: UUID,
    transferTargetType: 'hospital' | 'transferPoint'
) {
    if (!logActive(state)) return;

    const source = getElement(state, 'transferPoint', transferSourceId);
    const target = getElement(state, transferTargetType, transferTargetId);

    logTransferPoint(
        state,
        [
            transferTargetType === 'transferPoint'
                ? isInSimulatedRegion(target as WithPosition)
                    ? createSimulatedRegionTag(
                          state,
                          currentSimulatedRegionOf(
                              state,
                              target as WithPosition
                          ).id
                      )
                    : createTransferPointTag(state, transferTargetId)
                : createHospitalTag(state, transferTargetId),
        ],
        `Der Transfer von ${source.externalName} nach ${
            transferTargetType === 'transferPoint'
                ? (target as TransferPoint).externalName
                : (target as Hospital).name
        } wurde entfernt.`,
        transferSourceId
    );
}

export function logElementAddedToTransfer(
    state: Mutable<ExerciseState>,
    transferSourceId: UUID,
    transferSourceType: 'alarmGroup' | 'transferPoint',
    elementId: UUID,
    elementType: 'personnel' | 'vehicle',
    transferTargetId: UUID,
    transferTargetType: 'hospital' | 'transferPoint',
    duration: number
) {
    if (!logActive(state)) return;

    const target = getElement(state, transferTargetType, transferTargetId);
    const element = getElement(state, elementType, elementId);

    if (transferSourceType === 'alarmGroup') {
        const alarmGroup = getElement(state, 'alarmGroup', transferSourceId);

        logAlarmGroup(
            state,
            [
                transferTargetType === 'transferPoint'
                    ? isInSimulatedRegion(target as WithPosition)
                        ? createSimulatedRegionTag(
                              state,
                              currentSimulatedRegionOf(
                                  state,
                                  target as WithPosition
                              ).id
                          )
                        : createTransferPointTag(state, transferTargetId)
                    : createHospitalTag(state, transferTargetId),
            ],
            `Ein ${
                elementType === 'personnel'
                    ? (element as Personnel).personnelType
                    : (element as Vehicle).name
            } wird in ${duration}ms von ${alarmGroup.name} nach ${
                transferTargetType === 'transferPoint'
                    ? (target as TransferPoint).externalName
                    : (target as Hospital).name
            } transferiert.`,
            transferSourceId
        );
        return;
    }

    const source = getElement(state, 'transferPoint', transferSourceId);

    logTransferPoint(
        state,
        [
            transferTargetType === 'transferPoint'
                ? isInSimulatedRegion(target as WithPosition)
                    ? createSimulatedRegionTag(
                          state,
                          currentSimulatedRegionOf(
                              state,
                              target as WithPosition
                          ).id
                      )
                    : createTransferPointTag(state, transferTargetId)
                : createHospitalTag(state, transferTargetId),
        ],
        `Ein ${
            elementType === 'personnel'
                ? (element as Personnel).personnelType
                : (element as Vehicle).name
        } wird in ${duration}ms von ${source.externalName} nach ${
            transferTargetType === 'transferPoint'
                ? (target as TransferPoint).externalName
                : (target as Hospital).name
        } transferiert.`,
        transferSourceId
    );
}

export function logTransferEdited(
    state: Mutable<ExerciseState>,
    elementId: UUID,
    elementType: 'personnel' | 'vehicle',
    oldTransferTargetId: UUID,
    newTransferTargetId: UUID,
    oldDuration: number,
    newDuration: number
) {
    if (!logActive(state)) return;

    const oldTarget = getElement(state, 'transferPoint', oldTransferTargetId);
    const newTarget = getElement(state, 'transferPoint', newTransferTargetId);
    const element = getElement(state, elementType, elementId);

    logTransferPoint(
        state,
        newTransferTargetId === oldTransferTargetId
            ? []
            : [createTransferPointTag(state, oldTransferTargetId)],
        `Der Transfer von ${
            elementType === 'personnel'
                ? (element as Personnel).personnelType
                : (element as Vehicle).name
        } nach ${
            oldTarget.externalName
        } in ${oldDuration}ms wurde geändert, und geht jetzt nach ${
            newTarget.externalName
        } in ${newDuration}ms.`,
        newTransferTargetId
    );
}

export function logTransferFinished(
    state: Mutable<ExerciseState>,
    elementId: UUID,
    elementType: 'personnel' | 'vehicle',
    transferTargetId: UUID
) {
    if (!logActive(state)) return;

    const target = getElement(state, 'transferPoint', transferTargetId);
    const element = getElement(state, elementType, elementId);

    logTransferPoint(
        state,
        [],
        `Der Transfer von ${
            elementType === 'personnel'
                ? (element as Personnel).personnelType
                : (element as Vehicle).name
        } nach ${target.externalName} wurde abgeschlossen.`,
        transferTargetId
    );
}

export function logTransferPause(
    state: Mutable<ExerciseState>,
    elementId: UUID,
    elementType: 'personnel' | 'vehicle',
    transferTargetId: UUID,
    paused: boolean
) {
    if (!logActive(state)) return;

    const target = getElement(state, 'transferPoint', transferTargetId);
    const element = getElement(state, elementType, elementId);

    logTransferPoint(
        state,
        [],
        `Der Transfer von ${
            elementType === 'personnel'
                ? (element as Personnel).personnelType
                : (element as Vehicle).name
        } nach ${target.externalName} wurde ${
            paused ? 'pausiers' : 'fortgesetzt'
        }.`,
        transferTargetId
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
            )}.`;
        }
        case 'transferCategoryCompletedRadiogram': {
            return `Der Transport der Kategorie ${
                statusNames[radiogram.completedCategory]
            } wurde abgeshlossen.`;
        }
        case 'transferCountsRadiogram': {
            return `Es wurden die folgenden Patientenzahlen ${
                radiogram.scope === 'singleRegion'
                    ? 'in dieser Region'
                    : 'in den Regionen'
            } abtransportiert: ${generateCountString(
                radiogram.transferredPatientsCounts,
                (status) => statusNames[status]
            )}. Nun verbleiben noch die folgenden Patienten: ${generateCountString(
                radiogram.remainingPatientsCounts,
                (status) => statusNames[status]
            )}`;
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
