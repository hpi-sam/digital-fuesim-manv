import { IsOptional, IsUUID } from 'class-validator';
import { groupBy } from 'lodash-es';
import type { SimulatedRegion, Vehicle } from '../../models';
import type {
    MaterialCountRadiogram,
    PersonnelCountRadiogram,
    VehicleCountRadiogram,
} from '../../models/radiogram';
import type { PersonnelType } from '../../models/utils';
import {
    IsLeaderOccupation,
    NoOccupation,
    isUnoccupied,
    getCreate,
    isInSpecificSimulatedRegion,
} from '../../models/utils';
import { getActivityById } from '../../store/action-reducers/utils';
import type { Mutable } from '../../utils';
import {
    StrictObject,
    cloneDeepMutable,
    UUID,
    uuid,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import { LeaderChangedEvent } from '../events/leader-changed';
import type { ExerciseState } from '../../state';
import { addActivity } from '../activities/utils';
import { DelayEventActivityState } from '../activities';
import { nextUUID } from '../utils/randomness';
import { IsStringSet } from '../../utils/validators/is-string-set';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AssignLeaderBehaviorState implements SimulationBehaviorState {
    @IsValue('assignLeaderBehavior' as const)
    readonly type = 'assignLeaderBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly leaderId: UUID | undefined;

    @IsStringSet()
    public readonly leadershipVehicleTypes: { [key: string]: true } = {
        'GW-San': true,
    };

    static readonly create = getCreate(this);
}

const personnelPriorities: { [Key in PersonnelType]: number } = {
    notarzt: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    gf: 4,
};

export const assignLeaderBehavior: SimulationBehavior<AssignLeaderBehaviorState> =
    {
        behaviorState: AssignLeaderBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            switch (event.type) {
                case 'tickEvent':
                    {
                        const leader = behaviorState.leaderId
                            ? draftState.personnel[behaviorState.leaderId]
                            : undefined;

                        const vehicleOfLeader = leader
                            ? draftState.vehicles[leader.vehicleId]
                            : undefined;

                        if (
                            behaviorState.leaderId &&
                            (!leader ||
                                !vehicleOfLeader ||
                                !isInSpecificSimulatedRegion(
                                    vehicleOfLeader,
                                    simulatedRegion.id
                                ) ||
                                vehicleOfLeader.occupation.type !==
                                    'isLeaderOccupation' ||
                                vehicleOfLeader.occupation.simulatedRegionId !==
                                    simulatedRegion.id)
                        ) {
                            changeLeader(
                                draftState,
                                simulatedRegion,
                                behaviorState,
                                vehicleOfLeader,
                                undefined
                            );
                        }

                        const vehicles = Object.values(
                            draftState.vehicles
                        ).filter(
                            (vehicle) =>
                                isInSpecificSimulatedRegion(
                                    vehicle,
                                    simulatedRegion.id
                                ) &&
                                isUnoccupied(vehicle, draftState.currentTime)
                        );

                        if (
                            !behaviorState.leaderId ||
                            !vehicleOfLeader ||
                            !behaviorState.leadershipVehicleTypes[
                                vehicleOfLeader.vehicleType
                            ]
                        ) {
                            const leadershipVehicles = vehicles.filter(
                                (vehicle) =>
                                    behaviorState.leadershipVehicleTypes[
                                        vehicle.vehicleType
                                    ]
                            );

                            if (leadershipVehicles.length > 0) {
                                changeLeader(
                                    draftState,
                                    simulatedRegion,
                                    behaviorState,
                                    vehicleOfLeader,
                                    leadershipVehicles[0]!
                                );
                            }
                        }

                        if (!behaviorState.leaderId) {
                            if (vehicles.length > 0) {
                                changeLeader(
                                    draftState,
                                    simulatedRegion,
                                    behaviorState,
                                    vehicleOfLeader,
                                    vehicles[0]!
                                );
                            }
                        }
                    }
                    break;
                case 'collectInformationEvent':
                    // This behavior answerers queries for material, personnel and vehicles because the leader typically holds those information
                    {
                        // If there is no leader queries cant be answered
                        if (!behaviorState.leaderId) {
                            return;
                        }
                        switch (event.informationType) {
                            case 'materialCount':
                                {
                                    const radiogram = getActivityById(
                                        draftState,
                                        simulatedRegion.id,
                                        event.generateReportActivityId,
                                        'generateReportActivity'
                                    )
                                        .radiogram as Mutable<MaterialCountRadiogram>;
                                    const materials = Object.values(
                                        draftState.materials
                                    ).filter((material) =>
                                        isInSpecificSimulatedRegion(
                                            material,
                                            simulatedRegion.id
                                        )
                                    );
                                    radiogram.materialForPatients.red =
                                        materials
                                            .map(
                                                (material) =>
                                                    material.canCaterFor.red
                                            )
                                            .reduce((a, b) => a + b, 0);
                                    radiogram.materialForPatients.yellow =
                                        materials
                                            .map(
                                                (material) =>
                                                    material.canCaterFor.yellow
                                            )
                                            .reduce((a, b) => a + b, 0);
                                    radiogram.materialForPatients.green =
                                        materials
                                            .map(
                                                (material) =>
                                                    material.canCaterFor.green
                                            )
                                            .reduce((a, b) => a + b, 0);

                                    radiogram.informationAvailable = true;
                                }
                                break;
                            case 'personnelCount':
                                {
                                    const radiogram = getActivityById(
                                        draftState,
                                        simulatedRegion.id,
                                        event.generateReportActivityId,
                                        'generateReportActivity'
                                    )
                                        .radiogram as Mutable<PersonnelCountRadiogram>;
                                    const personnelCount =
                                        radiogram.personnelCount;
                                    const personnel = Object.values(
                                        draftState.personnel
                                    ).filter((person) =>
                                        isInSpecificSimulatedRegion(
                                            person,
                                            simulatedRegion.id
                                        )
                                    );
                                    const groupedPersonnel = groupBy(
                                        personnel,
                                        (person) => person.personnelType
                                    );
                                    personnelCount.gf =
                                        groupedPersonnel['gf']?.length ?? 0;
                                    personnelCount.notSan =
                                        groupedPersonnel['notSan']?.length ?? 0;
                                    personnelCount.notarzt =
                                        groupedPersonnel['notarzt']?.length ??
                                        0;
                                    personnelCount.rettSan =
                                        groupedPersonnel['rettSan']?.length ??
                                        0;
                                    personnelCount.san =
                                        groupedPersonnel['san']?.length ?? 0;

                                    radiogram.informationAvailable = true;
                                }
                                break;
                            case 'vehicleCount':
                                {
                                    const radiogram = getActivityById(
                                        draftState,
                                        simulatedRegion.id,
                                        event.generateReportActivityId,
                                        'generateReportActivity'
                                    )
                                        .radiogram as Mutable<VehicleCountRadiogram>;
                                    const vehicles = Object.values(
                                        draftState.vehicles
                                    ).filter((vehicle) =>
                                        isInSpecificSimulatedRegion(
                                            vehicle,
                                            simulatedRegion.id
                                        )
                                    );
                                    const groupedVehicles = groupBy(
                                        vehicles,
                                        (vehicle) => vehicle.vehicleType
                                    );
                                    radiogram.vehicleCount = Object.fromEntries(
                                        StrictObject.entries(
                                            groupedVehicles
                                        ).map(([vehicleType, vehicleGroup]) => [
                                            vehicleType,
                                            vehicleGroup.length,
                                        ])
                                    );

                                    radiogram.informationAvailable = true;
                                }
                                break;
                            default:
                            // Ignore event
                        }
                    }
                    break;
                default:
                // Ignore event
            }
        },
    };

function changeLeader(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<AssignLeaderBehaviorState>,
    currentVehicle: Mutable<Vehicle> | undefined,
    newVehicle: Mutable<Vehicle> | undefined
) {
    if (currentVehicle) {
        currentVehicle.occupation = cloneDeepMutable(NoOccupation.create());
    }
    if (newVehicle) {
        newVehicle.occupation = cloneDeepMutable(
            IsLeaderOccupation.create(simulatedRegion.id)
        );
    }

    const newLeaderId = newVehicle
        ? Object.values(draftState.personnel)
              .filter((personnel) => newVehicle.personnelIds[personnel.id])
              .sort(
                  (a, b) =>
                      personnelPriorities[b.personnelType] -
                      personnelPriorities[a.personnelType]
              )[0]?.id
        : undefined;

    addActivity(
        simulatedRegion,
        DelayEventActivityState.create(
            nextUUID(draftState),
            LeaderChangedEvent.create(
                behaviorState.leaderId ?? null,
                newLeaderId ?? null
            ),
            draftState.currentTime
        )
    );
    behaviorState.leaderId = newLeaderId;
}
