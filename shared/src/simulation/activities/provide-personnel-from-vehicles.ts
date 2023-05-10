import { IsString, IsUUID } from 'class-validator';
import type { SimulatedRegion } from '../../models';
import type { PersonnelType } from '../../models/utils';
import {
    PersonnelResource,
    VehicleResource,
    getCreate,
} from '../../models/utils';
import {
    addResourceDescription,
    greaterEqualResourceDescription,
    ResourceDescription,
} from '../../models/utils/resource-description';
import type { ExerciseState } from '../../state';
import {
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuidArrayValidationOptions,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { ResourceRequiredEvent } from '../events';
import { sendSimulationEvent } from '../events/utils';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';
import type { UnloadVehicleActivityState } from './unload-vehicle';

export class ProvidePersonnelFromVehiclesActivityState
    implements SimulationActivityState
{
    @IsValue('providePersonnelFromVehicleActivity' as const)
    public readonly type = 'providePersonnelFromVehicleActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsResourceDescription()
    public readonly requiredPersonnelCounts: ResourceDescription<PersonnelType>;

    @IsUUID(4, uuidArrayValidationOptions)
    public readonly vehiclePriorities: readonly UUID[];

    @IsString()
    public readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        requiredPersonnelCounts: ResourceDescription<PersonnelType>,
        vehiclePriorities: UUID[],
        key: string
    ) {
        this.vehiclePriorities = vehiclePriorities;
        this.requiredPersonnelCounts = requiredPersonnelCounts;
        this.id = id;
        this.key = key;
    }

    static readonly create = getCreate(this);
}

export const providePersonnelFromVehiclesActivity: SimulationActivity<ProvidePersonnelFromVehiclesActivityState> =
    {
        activityState: ProvidePersonnelFromVehiclesActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            // We count personnel of unloading vehicles as provided because it should be available shortly.
            let availablePersonnel = personnelInUnloadingVehicles(
                draftState,
                simulatedRegion
            );
            const missingPersonnel = activityState.requiredPersonnelCounts;

            const vehiclePriorities = activityState.vehiclePriorities
                .map((id) => personnelInVehicleTemplate(draftState, id))
                .filter(
                    (
                        priority
                    ): priority is {
                        vehicleType: string;
                        vehiclePersonnel: ResourceDescription<PersonnelType>;
                    } => priority.vehicleType !== undefined
                );
            const missingVehicleCounts: ResourceDescription = {};

            const personnelStillMissing = ([personnelType, personnelCount]: [
                PersonnelType,
                number
            ]) => personnelCount > availablePersonnel[personnelType];

            while (
                !greaterEqualResourceDescription(
                    availablePersonnel,
                    missingPersonnel
                )
            ) {
                const minRequiredVehiclePriorities = StrictObject.entries(
                    missingPersonnel
                )
                    .filter(personnelStillMissing)
                    .map(([personnelType]) =>
                        vehiclePriorities.findIndex(
                            // Match requested personnel type exactly, no better personnel is accepted as substitute
                            ({ vehiclePersonnel: personnel }) =>
                                personnel[personnelType] > 0
                        )
                    );
                // We use max here because we need the vehicle with the highest value in this list anyways and might
                // save 'smaller' vehicles of higher priority that would be extra if we used min
                const selectedTemplateIndex = Math.max(
                    ...minRequiredVehiclePriorities
                );
                if (selectedTemplateIndex === -1) {
                    // The rest of the personnel needs cannot be satisfied with the allowed vehicle templates. They are ignored for now.
                    break;
                }
                const { vehicleType, vehiclePersonnel } =
                    vehiclePriorities[selectedTemplateIndex]!;
                missingVehicleCounts[vehicleType] =
                    (missingVehicleCounts[vehicleType] ?? 0) + 1;
                availablePersonnel = addResourceDescription(
                    availablePersonnel,
                    vehiclePersonnel
                );
            }

            const event = ResourceRequiredEvent.create(
                simulatedRegion.id,
                VehicleResource.create(missingVehicleCounts),
                activityState.key
            );
            sendSimulationEvent(simulatedRegion, event);

            terminate();
        },
    };

function personnelInVehicleTemplate(
    draftState: ExerciseState,
    templateId: UUID
): {
    vehicleType: string | undefined;
    vehiclePersonnel: ResourceDescription<PersonnelType>;
} {
    const resource = cloneDeepMutable(
        PersonnelResource.create()
    ).personnelCounts;
    const template = draftState.vehicleTemplates.filter(
        (tp) => tp.id === templateId
    )[0];
    if (template) {
        template.personnel.forEach((pt) => {
            resource[pt]++;
        });
    }
    return { vehicleType: template?.vehicleType, vehiclePersonnel: resource };
}

function personnelInUnloadingVehicles(
    draftState: ExerciseState,
    simulatedRegion: SimulatedRegion
): ResourceDescription<PersonnelType> {
    const resource = cloneDeepMutable(
        PersonnelResource.create()
    ).personnelCounts;
    StrictObject.values(simulatedRegion.activities)
        .filter(
            (a): a is UnloadVehicleActivityState =>
                a.type === 'unloadVehicleActivity'
        )
        .flatMap((activity) =>
            StrictObject.keys(
                draftState.vehicles[activity.vehicleId]?.personnelIds ?? {}
            )
        )
        .map((personnelId) => draftState.personnel[personnelId]?.personnelType)
        .filter((pt): pt is PersonnelType => pt !== undefined)
        .forEach((pt) => resource[pt]++);
    return resource;
}
