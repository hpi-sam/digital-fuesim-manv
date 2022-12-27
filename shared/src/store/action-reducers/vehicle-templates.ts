import { Type } from 'class-transformer';
import {
    IsString,
    ValidateNested,
    IsUUID,
    IsInt,
    IsArray,
} from 'class-validator';
import { VehicleTemplate } from '../../models';
import type { PersonnelType } from '../../models/utils';
import { ImageProperties } from '../../models/utils';
import type { MaterialType } from '../../models/utils/material-type';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { uuidValidationOptions, UUID, cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddVehicleTemplateAction implements Action {
    @IsString()
    public readonly type = '[VehicleTemplate] Add vehicleTemplate';

    @ValidateNested()
    @Type(() => VehicleTemplate)
    public readonly vehicleTemplate!: VehicleTemplate;
}

export class EditVehicleTemplateAction implements Action {
    @IsString()
    public readonly type = '[VehicleTemplate] Edit vehicleTemplate';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;

    @IsString()
    public readonly name!: string;

    @IsString()
    public readonly vehicleType!: string;

    @IsInt()
    public readonly patientCapacity!: number;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image!: ImageProperties;

    @IsString({ each: true })
    @IsArray()
    public readonly materials!: readonly MaterialType[];

    @IsString({ each: true })
    @IsArray()
    public readonly personnelTypes!: readonly PersonnelType[];
}

export class DeleteVehicleTemplateAction implements Action {
    @IsString()
    public readonly type = '[VehicleTemplate] Delete vehicleTemplates';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;
}

export namespace VehicleTemplateActionReducers {
    export const addVehicleTemplate: ActionReducer<AddVehicleTemplateAction> = {
        action: AddVehicleTemplateAction,
        reducer: (draftState, { vehicleTemplate }) => {
            if (
                draftState.vehicleTemplates.some(
                    (template) => template.id === vehicleTemplate.id
                )
            ) {
                throw new ReducerError(
                    `VehicleTemplate with id ${vehicleTemplate.id} already exists`
                );
            }
            draftState.vehicleTemplates.push(cloneDeepMutable(vehicleTemplate));
            return draftState;
        },
        rights: 'trainer',
    };

    export const editVehicleTemplate: ActionReducer<EditVehicleTemplateAction> =
        {
            action: EditVehicleTemplateAction,
            reducer: (
                draftState,
                {
                    id,
                    name,
                    vehicleType,
                    image,
                    patientCapacity,
                    materials,
                    personnelTypes,
                }
            ) => {
                const vehicleTemplate = getVehicleTemplate(draftState, id);
                vehicleTemplate.image = cloneDeepMutable(image);
                vehicleTemplate.name = name;
                vehicleTemplate.patientCapacity = patientCapacity;
                vehicleTemplate.vehicleType = vehicleType;
                vehicleTemplate.materials = cloneDeepMutable(materials);
                vehicleTemplate.personnel = cloneDeepMutable(personnelTypes);

                return draftState;
            },
            rights: 'trainer',
        };

    export const deleteVehicleTemplate: ActionReducer<DeleteVehicleTemplateAction> =
        {
            action: DeleteVehicleTemplateAction,
            reducer: (draftState, { id }) => {
                getVehicleTemplate(draftState, id);
                draftState.vehicleTemplates =
                    draftState.vehicleTemplates.filter(
                        (template) => template.id !== id
                    );
                // Delete every alarm group that uses this template
                draftState.alarmGroups = Object.fromEntries(
                    Object.entries(draftState.alarmGroups).filter(
                        ([_, alarmGroup]) =>
                            !Object.values(alarmGroup.alarmGroupVehicles).some(
                                (alarmGroupVehicle) =>
                                    alarmGroupVehicle.vehicleTemplateId === id
                            )
                    )
                );
                return draftState;
            },
            rights: 'trainer',
        };
}

function getVehicleTemplate(
    state: Mutable<ExerciseState>,
    id: UUID
): Mutable<VehicleTemplate> {
    const vehicleTemplate = state.vehicleTemplates.find(
        (template) => template.id === id
    );
    if (!vehicleTemplate) {
        throw new ReducerError(`VehicleTemplate with id ${id} does not exist`);
    }
    return vehicleTemplate;
}
