/* eslint-disable @typescript-eslint/no-throw-literal */
import { getStatus } from '../../models/utils';
import type { ExerciseAction } from '../exercise.actions';
import { imageSizeToPosition } from '../../state-helpers';
import { StatusHistoryEntry } from '../../models';
import { cloneDeepMutable } from '../../utils/clone-deep-mutable';
import type { ReducerFunction } from './reducer-function';
import { calculateTreatments } from './calculate-treatments';
import { ReducerError } from '.';

/**
 * Here are all the reducers for the exercise state specified.
 * The key is the action type and the value is the reducer function.
 */
export const exerciseReducerMap: {
    [Action in ExerciseAction as Action['type']]: ReducerFunction<Action>;
} = {
    '[Viewport] Add viewport': (draftState, { viewport }) => {
        draftState.viewports[viewport.id] = viewport;
        return draftState;
    },
    '[Viewport] Remove viewport': (draftState, { viewportId }) => {
        if (!draftState.viewports[viewportId]) {
            throw new ReducerError(
                `Viewport with id ${viewportId} does not exist`
            );
        }
        delete draftState.viewports[viewportId];
        return draftState;
    },
    '[Patient] Add patient': (draftState, { patient }) => {
        if (
            Object.entries(patient.healthStates).some(
                ([id, healthState]) => healthState.id !== id
            )
        ) {
            throw new ReducerError(
                "Not all health state's ids match their key id"
            );
        }
        Object.values(patient.healthStates).forEach((healthState) => {
            healthState.nextStateConditions.forEach((nextStateCondition) => {
                if (
                    patient.healthStates[
                        nextStateCondition.matchingHealthStateId
                    ] === undefined
                ) {
                    throw new ReducerError(
                        `HealthState with id ${nextStateCondition.matchingHealthStateId} does not exist`
                    );
                }
            });
        });
        if (patient.healthStates[patient.currentHealthStateId] === undefined) {
            throw new ReducerError(
                `HealthState with id ${patient.currentHealthStateId} does not exist`
            );
        }
        draftState.patients[patient.id] = cloneDeepMutable(patient);
        calculateTreatments(draftState);
        return draftState;
    },
    '[Patient] Move patient': (draftState, { patientId, targetPosition }) => {
        const patient = draftState.patients[patientId];
        if (!patient) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        patient.position = targetPosition;
        calculateTreatments(draftState);
        return draftState;
    },
    '[Patient] Remove patient': (draftState, { patientId }) => {
        if (!draftState.patients[patientId]) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        delete draftState.patients[patientId];
        calculateTreatments(draftState);
        return draftState;
    },
    '[Vehicle] Add vehicle': (draftState, { vehicle, material, personnel }) => {
        draftState.vehicles[vehicle.id] = vehicle;
        draftState.materials[material.id] = material;
        for (const person of personnel) {
            draftState.personnel[person.id] = person;
        }
        return draftState;
    },
    '[Vehicle] Move vehicle': (draftState, { vehicleId, targetPosition }) => {
        const vehicle = draftState.vehicles[vehicleId];
        if (!vehicle) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        vehicle.position = targetPosition;
        return draftState;
    },
    '[Vehicle] Unload vehicle': (draftState, { vehicleId }) => {
        const vehicle = draftState.vehicles[vehicleId];
        if (!vehicle) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        const unloadPosition = vehicle.position;
        if (!unloadPosition) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} is currently in transfer`
            );
        }
        const material = draftState.materials[vehicle.materialId];
        const personnel = Object.keys(vehicle.personnelIds).map(
            (personnelId) => draftState.personnel[personnelId]
        );
        const patients = Object.keys(vehicle.patientIds).map(
            (patientId) => draftState.patients[patientId]
        );
        const vehicleWidthInPosition = imageSizeToPosition(
            vehicle.image.aspectRatio * vehicle.image.height
        );
        const numberOfMaterial = 1;
        const space =
            vehicleWidthInPosition /
            (personnel.length + numberOfMaterial + patients.length + 1);
        let x = unloadPosition.x - vehicleWidthInPosition / 2;
        for (const patient of patients) {
            x += space;
            patient.position ??= {
                x,
                y: unloadPosition.y,
            };
            delete vehicle.patientIds[patient.id];
        }
        for (const person of personnel) {
            x += space;
            // TODO: only if the person is not in transfer
            person.position ??= {
                x,
                y: unloadPosition.y,
            };
        }
        x += space;
        material.position ??= {
            x,
            y: unloadPosition.y,
        };
        calculateTreatments(draftState);
        return draftState;
    },
    '[Vehicle] Load vehicle': (
        draftState,
        { vehicleId, elementToBeLoadedId, elementToBeLoadedType }
    ) => {
        const vehicle = draftState.vehicles[vehicleId];
        if (!vehicle) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        switch (elementToBeLoadedType) {
            case 'material': {
                const material = draftState.materials[elementToBeLoadedId];
                if (!material) {
                    throw new ReducerError(
                        `Material with id ${elementToBeLoadedId} does not exist`
                    );
                }
                if (vehicle.materialId !== material.id) {
                    throw new ReducerError(
                        `Material with id ${material.id} is not assignable to the vehicle with id ${vehicle.id}`
                    );
                }
                material.position = undefined;
                break;
            }
            case 'personnel': {
                const personnel = draftState.personnel[elementToBeLoadedId];
                if (!personnel) {
                    throw new ReducerError(
                        `Personnel with id ${elementToBeLoadedId} does not exist`
                    );
                }
                if (!vehicle.personnelIds[elementToBeLoadedId]) {
                    throw new ReducerError(
                        `Personnel with id ${personnel.id} is not assignable to the vehicle with id ${vehicle.id}`
                    );
                }
                personnel.position = undefined;
                break;
            }
            case 'patient': {
                const patient = draftState.patients[elementToBeLoadedId];
                if (!patient) {
                    throw new ReducerError(
                        `Patient with id ${elementToBeLoadedId} does not exist`
                    );
                }
                if (
                    Object.keys(vehicle.patientIds).length >=
                    vehicle.patientCapacity
                ) {
                    throw new ReducerError(
                        `Vehicle with id ${vehicle.id} is already full`
                    );
                }
                vehicle.patientIds[elementToBeLoadedId] = true;
                patient.position = undefined;
                draftState.materials[vehicle.materialId].position = undefined;
                Object.keys(vehicle.personnelIds).forEach((personnelId) => {
                    draftState.personnel[personnelId].position = undefined;
                });
            }
        }
        calculateTreatments(draftState);
        return draftState;
    },
    '[Vehicle] Remove vehicle': (draftState, { vehicleId }) => {
        if (!draftState.vehicles[vehicleId]) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        delete draftState.vehicles[vehicleId];
        return draftState;
    },
    '[Personnel] Move personnel': (
        draftState,
        { personnelId, targetPosition }
    ) => {
        const personnel = draftState.personnel[personnelId];
        if (!personnel) {
            throw new ReducerError(
                `Personnel with id ${personnelId} does not exist`
            );
        }
        personnel.position = targetPosition;
        calculateTreatments(draftState);
        return draftState;
    },
    '[Material] Move material': (
        draftState,
        { materialId, targetPosition }
    ) => {
        const material = draftState.materials[materialId];
        if (!material) {
            throw new ReducerError(
                `Material with id ${materialId} does not exist`
            );
        }
        material.position = targetPosition;
        calculateTreatments(draftState);
        return draftState;
    },
    '[Client] Add client': (draftState, { client }) => {
        draftState.clients[client.id] = client;
        return draftState;
    },
    '[Client] Remove client': (draftState, { clientId }) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        delete draftState.clients[clientId];
        return draftState;
    },
    '[Client] Restrict to viewport': (draftState, { clientId, viewportId }) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        if (viewportId === undefined) {
            draftState.clients[clientId].viewRestrictedToViewportId =
                viewportId;
            return draftState;
        }
        if (!draftState.viewports[viewportId]) {
            throw new ReducerError(
                `Viewport with id ${viewportId} does not exist`
            );
        }
        draftState.clients[clientId].viewRestrictedToViewportId = viewportId;
        return draftState;
    },
    '[Client] Set waitingroom': (
        draftState,
        { clientId, shouldBeInWaitingRoom }
    ) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        draftState.clients[clientId].isInWaitingRoom = shouldBeInWaitingRoom;
        return draftState;
    },
    '[Exercise] Pause': (draftState, { timestamp }) => {
        const statusHistoryEntry = StatusHistoryEntry.create(
            'paused',
            new Date(timestamp)
        );

        draftState.statusHistory.push(statusHistoryEntry);

        return draftState;
    },
    '[Exercise] Start': (draftState, { timestamp }) => {
        const statusHistoryEntry = StatusHistoryEntry.create(
            'running',
            new Date(timestamp)
        );

        draftState.statusHistory.push(statusHistoryEntry);

        return draftState;
    },
    '[Exercise] Tick': (draftState, { patientUpdates, refreshTreatments }) => {
        patientUpdates.forEach((patientUpdate) => {
            const currentPatient = draftState.patients[patientUpdate.id];
            currentPatient.currentHealthStateId = patientUpdate.nextStateId;
            currentPatient.health = patientUpdate.nextHealthPoints;
            currentPatient.stateTime = patientUpdate.nextStateTime;
            currentPatient.realStatus = getStatus(currentPatient.health);
            if (currentPatient.visibleStatus !== null) {
                currentPatient.visibleStatus = currentPatient.realStatus;
            }
        });
        if (refreshTreatments) {
            calculateTreatments(draftState);
        }
        return draftState;
    },
    '[Exercise] Set Participant Id': (draftState, { participantId }) => {
        draftState.participantId = participantId;
        return draftState;
    },
    '[TransferPoint] Add TransferPoint': (draftState, { transferPoint }) => {
        draftState.transferPoints[transferPoint.id] = transferPoint;
        return draftState;
    },
    '[TransferPoint] Move TransferPoint': (
        draftState,
        { transferPointId, targetPosition }
    ) => {
        const transferPoint = draftState.transferPoints[transferPointId];
        if (!transferPoint) {
            throw new ReducerError(
                `TransferPoint with id ${transferPointId} does not exist`
            );
        }
        transferPoint.position = targetPosition;
        return draftState;
    },
    '[TransferPoint] Remove TransferPoint': (
        draftState,
        { transferPointId }
    ) => {
        if (!draftState.transferPoints[transferPointId]) {
            throw new ReducerError(
                `TransferPoint with id ${transferPointId} does not exist`
            );
        }
        delete draftState.transferPoints[transferPointId];
        // TODO: If we can assume that the transfer points are always connect to each other,
        // we could just iterate over draftState.transferPoints[transferPointId].reachableTransferPoints
        for (const _transferPointId of Object.keys(draftState.transferPoints)) {
            const transferPoint = draftState.transferPoints[_transferPointId];
            for (const connectedTransferPointId of Object.keys(
                transferPoint.reachableTransferPoints
            )) {
                const connectedTransferPoint =
                    draftState.transferPoints[connectedTransferPointId];
                delete connectedTransferPoint.reachableTransferPoints[
                    _transferPointId
                ];
            }
        }
        // TODO: Remove the vehicles and personnel in transit
        return draftState;
    },
};
