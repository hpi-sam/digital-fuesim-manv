import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { MapImageTemplate } from '../../models';
import { ImageProperties } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddMapImageTemplateAction implements Action {
    @IsString()
    public readonly type = '[MapImageTemplate] Add mapImageTemplate';

    @ValidateNested()
    @Type(() => MapImageTemplate)
    public readonly mapImageTemplate!: MapImageTemplate;
}

export class EditMapImageTemplateAction implements Action {
    @IsString()
    public readonly type = '[MapImageTemplate] Edit mapImageTemplate';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;

    @IsString()
    public readonly name!: string;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image!: ImageProperties;
}

export class DeleteMapImageTemplateAction implements Action {
    @IsString()
    public readonly type = '[MapImageTemplate] Delete mapImageTemplate';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;
}

export namespace MapImageTemplatesActionReducers {
    export const addMapImageTemplate: ActionReducer<AddMapImageTemplateAction> =
        {
            action: AddMapImageTemplateAction,
            reducer: (draftState, { mapImageTemplate }) => {
                if (
                    draftState.mapImageTemplates.some(
                        (template) => template.id === mapImageTemplate.id
                    )
                ) {
                    throw new ReducerError(
                        `MapImageTemplate with id ${mapImageTemplate.id} already exists`
                    );
                }
                draftState.mapImageTemplates.push(
                    cloneDeepMutable(mapImageTemplate)
                );
                return draftState;
            },
            rights: 'trainer',
        };

    export const editMapImageTemplate: ActionReducer<EditMapImageTemplateAction> =
        {
            action: EditMapImageTemplateAction,
            reducer: (draftState, { id, name, image }) => {
                const mapImageTemplate = getMapImageTemplate(draftState, id);
                mapImageTemplate.name = name;
                mapImageTemplate.image = cloneDeepMutable(image);
                return draftState;
            },
            rights: 'trainer',
        };

    export const deleteMapImageTemplate: ActionReducer<DeleteMapImageTemplateAction> =
        {
            action: DeleteMapImageTemplateAction,
            reducer: (draftState, { id }) => {
                getMapImageTemplate(draftState, id);
                draftState.mapImageTemplates =
                    draftState.mapImageTemplates.filter(
                        (template) => template.id !== id
                    );
                return draftState;
            },
            rights: 'trainer',
        };
}

function getMapImageTemplate(
    state: Mutable<ExerciseState>,
    id: UUID
): Mutable<MapImageTemplate> {
    const mapImageTemplate = state.mapImageTemplates.find(
        (template) => template.id === id
    );
    if (!mapImageTemplate) {
        throw new ReducerError(`MapImageTemplate with id ${id} does not exist`);
    }
    return mapImageTemplate;
}
