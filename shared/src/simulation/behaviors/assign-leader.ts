import { IsOptional, IsUUID } from 'class-validator';
import { groupBy } from 'lodash-es';
import type { SimulatedRegion } from '../../models';
import type {
    MaterialCountRadiogram,
    PersonnelCountRadiogram,
    VehicleCountRadiogram,
} from '../../models/radiogram';
import type { PersonnelType } from '../../models/utils';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import { getActivityById, getElement } from '../../store/action-reducers/utils';
import type { Mutable } from '../../utils';
import { StrictObject, UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { LeaderChangedEvent } from '../events/leader-changed';
import { sendSimulationEvent } from '../events/utils';
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
                case 'personnelAvailableEvent':
                    {
                        // If a gf (group leader of GW San) enters the region, we want to assign them as leader, since a gf can't treat patients
                        // A gf has the highest priority, so they would be chosen by the logic for the tick event anyways
                        // Therefore, this branch only serves the purpose to switch the leader
                        if (!behaviorState.leaderId) {
                            return;
                        }

                        const currentLeader = getElement(
                            draftState,
                            'personnel',
                            behaviorState.leaderId
                        );

                        if (currentLeader.personnelType === 'gf') {
                            return;
                        }

                        const newPersonnel = getElement(
                            draftState,
                            'personnel',
                            event.personnelId
                        );

                        if (newPersonnel.personnelType === 'gf') {
                            changeLeader(
                                simulatedRegion,
                                behaviorState,
                                event.personnelId
                            );
                        }
                    }
                    break;
                case 'tickEvent':
                    {
                        if (!behaviorState.leaderId) {
                            const personnel = Object.values(
                                draftState.personnel
                            ).filter(
                                (pers) =>
                                    isInSpecificSimulatedRegion(
                                        pers,
                                        simulatedRegion.id
                                    ) && pers.personnelType !== 'notarzt'
                            );

                            if (personnel.length === 0) {
                                return;
                            }

                            personnel.sort(
                                (a, b) =>
                                    personnelPriorities[b.personnelType] -
                                    personnelPriorities[a.personnelType]
                            );
                            changeLeader(
                                simulatedRegion,
                                behaviorState,
                                personnel[0]?.id
                            );
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
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<AssignLeaderBehaviorState>,
    newLeaderId: UUID | undefined
) {
    sendSimulationEvent(
        simulatedRegion,
        LeaderChangedEvent.create(
            behaviorState.leaderId ?? null,
            newLeaderId ?? null
        )
    );
    behaviorState.leaderId = newLeaderId;
}
