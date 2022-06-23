import type { Patient, Personnel } from '../../../../models';
import { Viewport } from '../../../../models';
import type { ExerciseState } from '../../../../state';
import type { Mutable, UUID } from '../../../../utils';
import { patientTreatmentThresholds } from '../calculate-treatments';
import type { WithPosition } from './utils';
import { isNotPretriaged, removeFromArray } from './utils';

/**
 * @returns Whether any non-walkable patients are still to triage
 */
export function pretriage(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    patientIds: UUID[],
    personnelIds: UUID[]
): boolean {
    const patients = patientIds.map(
        (patientId) => state.patients[patientId]
    ) as Mutable<WithPosition<Patient>>[];
    const patientsToPretriage = patients
        .filter((patient) => isNotPretriaged(state, patient))
        .sort((left) => (left.pretriageInformation.isWalkable ? 1 : -1));
    if (patientsToPretriage.length === 0) {
        return false;
    }
    const personnel = personnelIds.map(
        (personnelId) => state.personnel[personnelId]
    ) as Mutable<WithPosition<Personnel>>[];
    if (personnel.length === 0) {
        return patientsToPretriage.some(
            (patient) => !patient.pretriageInformation.isWalkable
        );
    }
    const distance = patientTreatmentThresholds.specificThreshold * 0.9;
    for (
        let i = 0;
        i < patientsToPretriage.length && i < personnel.length;
        i++
    ) {
        personnel[i].position = {
            x: patientsToPretriage[i].position.x + distance,
            y: patientsToPretriage[i].position.y,
        };
        if (!Viewport.isInViewport(viewport, personnel[i].position)) {
            // Move personnel to the other side if it's not in the viewport.
            // TODO: This breaks with small viewports
            personnel[i].position.x -= 2 * distance;
        }
        // Remove personnel pretriaging non-walkable patients from list of available personnel
        if (patientsToPretriage[i].pretriageInformation.isWalkable) {
            removeFromArray(personnelIds, personnel[i].id);
        }
    }
    return patientsToPretriage.some(
        (patient) => !patient.pretriageInformation.isWalkable
    );
}
