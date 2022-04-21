/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import assert from 'node:assert';
import * as shared from 'digital-fuesim-manv-shared';
import type { WebsocketClient } from './utils';
import { createTestEnvironment, createExercise } from './utils';

describe('Exercise Walkthrough', () => {
    const dummyUuid = 'f4781b97-1efd-4011-8461-32bf74699b3a';
    const withMockedIds = async <T>(callback: () => T) => {
        // TODO: Improve typings
        const originalCreates = new Map<any, any>();
        const replaceCreate = (type: any) => {
            const originalCreate = type.create;
            type.create = (...args: any[]) => {
                const original = originalCreate(...args);
                const result = { ...original, id: dummyUuid };
                return result;
            };
            originalCreates.set(type, originalCreate);
        };
        const restoreCreates = () => {
            originalCreates.forEach((create, type) => {
                type.create = create;
            });
        };
        replaceCreate(shared.ExerciseState);
        replaceCreate(shared.Client);
        replaceCreate(shared.EocLogEntry);
        replaceCreate(shared.MapImageTemplate);
        replaceCreate(shared.MapImage);
        replaceCreate(shared.Material);
        replaceCreate(shared.PatientTemplate);
        replaceCreate(shared.Patient);
        replaceCreate(shared.Personnel);
        replaceCreate(shared.StatusHistoryEntry);
        replaceCreate(shared.TransferPoint);
        replaceCreate(shared.VehicleTemplate);
        replaceCreate(shared.Vehicle);
        replaceCreate(shared.Viewport);
        const callbackResult = await callback();
        restoreCreates();
        return callbackResult;
    };
    const environment = createTestEnvironment();
    async function assertCorrectness(
        socket: WebsocketClient,
        action: shared.ExerciseAction | undefined,
        resultingState: shared.ExerciseState
    ) {
        if (action) {
            const propose = await socket.emit('proposeAction', action);
            if (!propose.success) {
                console.log(propose.message);
            }
            expect(propose.success).toBe(true);
        }

        const newState = await socket.emit('getState');

        expect(newState.success).toBe(true);
        assert(newState.success);
        expect(newState.payload).toStrictEqual(resultingState);
    }

    it('correctly applies actions after each other', async () => {
        await environment.withWebsocket(async (socket) => {
            const exerciseIds = await withMockedIds(async () =>
                createExercise(environment)
            );
            const participantId = exerciseIds.participantId;
            const clientName = 'Name';
            const join = await withMockedIds(async () =>
                socket.emit('joinExercise', exerciseIds.trainerId, clientName)
            );

            expect(join.success).toBe(true);

            const state = {
                currentTime: 0 as const,
                id: dummyUuid,
                viewports: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.Viewport>;
                },
                vehicles: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.Vehicle>;
                },
                personnel: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.Personnel>;
                },
                patients: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.Patient>;
                },
                materials: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.Material>;
                },
                mapImages: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.MapImage>;
                },
                transferPoints: {} as {
                    [key: shared.UUID]: shared.Mutable<shared.TransferPoint>;
                },
                clients: {
                    [dummyUuid]: {
                        id: dummyUuid,
                        name: clientName,
                        isInWaitingRoom: false,
                        role: 'trainer' as shared.Role,
                        // viewRestrictedToViewportId: undefined,
                    },
                },
                patientTemplates: shared.defaultPatientTemplates,
                vehicleTemplates: shared.defaultVehicleTemplates,
                mapImageTemplates: shared.defaultMapImagesTemplates,
                ecoLog: [],
                statusHistory: [] as shared.StatusHistoryEntry[],
                participantId,
            };

            await assertCorrectness(socket, undefined, state);

            state.clients[dummyUuid].isInWaitingRoom = true;

            await assertCorrectness(
                socket,
                {
                    type: '[Client] Set waitingroom',
                    clientId: dummyUuid,
                    shouldBeInWaitingRoom: true,
                },
                state
            );

            state.clients[dummyUuid].isInWaitingRoom = false;

            await assertCorrectness(
                socket,
                {
                    type: '[Client] Set waitingroom',
                    clientId: dummyUuid,
                    shouldBeInWaitingRoom: false,
                },
                state
            );

            const originalDateNow = Date.now;
            Date.now = () => 42;

            state.statusHistory.push({
                id: dummyUuid,
                status: 'running',
                startTimestamp: new Date(
                    Date.now()
                ).toISOString() as unknown as shared.ImmutableDate,
            });

            await withMockedIds(async () =>
                assertCorrectness(
                    socket,
                    { type: '[Exercise] Start', timestamp: 0 },
                    state
                )
            );

            state.statusHistory.push({
                id: dummyUuid,
                status: 'paused',
                startTimestamp: new Date(
                    Date.now()
                ).toISOString() as unknown as shared.ImmutableDate,
            });

            await withMockedIds(async () =>
                assertCorrectness(
                    socket,
                    { type: '[Exercise] Pause', timestamp: 100 },
                    state
                )
            );

            Date.now = originalDateNow;

            const mapImage = shared.MapImage.create(
                shared.Position.create(24, 67),
                shared.ImageProperties.create('example.com', 100, 25 / 26)
            );

            state.mapImages[mapImage.id] = mapImage;

            await assertCorrectness(
                socket,
                {
                    type: '[MapImage] Add MapImage',
                    mapImage,
                },
                state
            );

            const targetPosition = shared.Position.create(1, 89);

            state.mapImages[mapImage.id].position = targetPosition;

            await assertCorrectness(
                socket,
                {
                    type: '[MapImage] Move MapImage',
                    mapImageId: mapImage.id,
                    targetPosition,
                },
                state
            );

            state.mapImages[mapImage.id].image.url = 'example.de';

            await assertCorrectness(
                socket,
                {
                    type: '[MapImage] Reconfigure Url',
                    mapImageId: mapImage.id,
                    newUrl: 'example.de',
                },
                state
            );

            state.mapImages[mapImage.id].image.aspectRatio = 23 / 24;
            state.mapImages[mapImage.id].image.height = 125;

            await assertCorrectness(
                socket,
                {
                    type: '[MapImage] Scale MapImage',
                    mapImageId: mapImage.id,
                    newAspectRatio: 23 / 24,
                    newHeight: 125,
                },
                state
            );

            delete state.mapImages[mapImage.id];

            await assertCorrectness(
                socket,
                { type: '[MapImage] Remove MapImage', mapImageId: mapImage.id },
                state
            );

            const patient =
                shared.generateDummyPatient() as shared.Mutable<shared.Patient>;

            delete patient.position;
            delete patient.vehicleId;

            state.patients[patient.id] = patient;

            await assertCorrectness(
                socket,
                { type: '[Patient] Add patient', patient },
                state
            );

            state.patients[patient.id].position = targetPosition;

            await assertCorrectness(
                socket,
                {
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    targetPosition,
                },
                state
            );

            const transferPoint = shared.TransferPoint.create(
                shared.Position.create(5184, 5141.757),
                {},
                'TP',
                'TransferPoint'
            );

            state.transferPoints[transferPoint.id] = transferPoint;

            await assertCorrectness(
                socket,
                { type: '[TransferPoint] Add TransferPoint', transferPoint },
                state
            );

            state.transferPoints[transferPoint.id].position = targetPosition;

            await assertCorrectness(
                socket,
                {
                    type: '[TransferPoint] Move TransferPoint',
                    transferPointId: transferPoint.id,
                    targetPosition,
                },
                state
            );

            const secondTransferPoint = shared.TransferPoint.create(
                shared.Position.create(5184, 5141.757),
                {},
                'TP',
                'TransferPoint'
            );

            state.transferPoints[secondTransferPoint.id] = secondTransferPoint;

            await assertCorrectness(
                socket,
                {
                    type: '[TransferPoint] Add TransferPoint',
                    transferPoint: secondTransferPoint,
                },
                state
            );

            state.transferPoints[transferPoint.id].reachableTransferPoints = {
                [secondTransferPoint.id]: { duration: 10 },
            };

            state.transferPoints[
                secondTransferPoint.id
            ].reachableTransferPoints = {
                [transferPoint.id]: { duration: 10 },
            };

            await assertCorrectness(
                socket,
                {
                    type: '[TransferPoint] Connect TransferPoints',
                    transferPointId1: transferPoint.id,
                    transferPointId2: secondTransferPoint.id,
                    duration: 10,
                },
                state
            );

            state.transferPoints[transferPoint.id].internalName = 'internal';
            state.transferPoints[transferPoint.id].externalName = 'external';

            await assertCorrectness(
                socket,
                {
                    type: '[TransferPoint] Rename TransferPoint',
                    transferPointId: transferPoint.id,
                    externalName: 'external',
                    internalName: 'internal',
                },
                state
            );

            const { materials, personnel, vehicle } = shared.addVehicle(
                state.vehicleTemplates[0],
                shared.Position.create(45, 78)
            );

            state.vehicles[vehicle.id] = vehicle;
            materials.forEach((material) => {
                delete (material as shared.Mutable<shared.Material>).position;
                state.materials[material.id] = material;
            });
            personnel.forEach((thisPersonnel) => {
                delete (thisPersonnel as shared.Mutable<shared.Personnel>)
                    .position;
                delete (thisPersonnel as shared.Mutable<shared.Personnel>)
                    .transfer;
                state.personnel[thisPersonnel.id] = thisPersonnel;
            });

            await assertCorrectness(
                socket,
                {
                    type: '[Vehicle] Add vehicle',
                    vehicle,
                    materials,
                    personnel,
                },
                state
            );

            // TODO:

            delete state.patients[patient.id];

            await assertCorrectness(
                socket,
                {
                    type: '[Patient] Remove patient',
                    patientId: patient.id,
                },
                state
            );
        });
    });
});
