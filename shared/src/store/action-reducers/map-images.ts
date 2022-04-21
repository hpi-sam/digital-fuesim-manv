/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import {
    IsString,
    ValidateNested,
    IsUUID,
    IsNumber,
    IsPositive,
} from 'class-validator';
import { MapImage } from '../../models';
import { Position } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { uuidValidationOptions, UUID } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddMapImageAction implements Action {
    @IsString()
    public readonly type = '[MapImage] Add MapImage';

    @ValidateNested()
    @Type(() => MapImage)
    public readonly mapImage!: MapImage;
}

export class MoveMapImageAction implements Action {
    @IsString()
    public readonly type = '[MapImage] Move MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class ScaleMapImageAction implements Action {
    @IsString()
    public readonly type = '[MapImage] Scale MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @IsNumber()
    @IsPositive()
    public readonly newHeight!: number;

    @IsNumber()
    @IsPositive()
    public readonly newAspectRatio!: number;
}

export class RemoveMapImageAction implements Action {
    @IsString()
    public readonly type = '[MapImage] Remove MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;
}

export class ReconfigureMapImageUrlAction implements Action {
    @IsString()
    public readonly type = '[MapImage] Reconfigure Url';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    /**
     * data URI or URL of new image
     */
    @IsString()
    public readonly newUrl!: string;
}

export namespace MapImagesActionReducers {
    export const addMapImage: ActionReducer<AddMapImageAction> = {
        action: AddMapImageAction,
        reducer: (draftState, { mapImage }) => {
            draftState.mapImages[mapImage.id] = mapImage;
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveMapImage: ActionReducer<MoveMapImageAction> = {
        action: MoveMapImageAction,
        reducer: (draftState, { mapImageId, targetPosition }) => {
            const mapImage = getMapImage(draftState, mapImageId);
            mapImage.position = targetPosition;
            return draftState;
        },
        rights: 'trainer',
    };

    export const scaleMapImage: ActionReducer<ScaleMapImageAction> = {
        action: ScaleMapImageAction,
        reducer: (draftState, { mapImageId, newHeight, newAspectRatio }) => {
            const mapImage = getMapImage(draftState, mapImageId);
            mapImage.image.height = newHeight;
            mapImage.image.aspectRatio = newAspectRatio;
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeMapImage: ActionReducer<RemoveMapImageAction> = {
        action: RemoveMapImageAction,
        reducer: (draftState, { mapImageId }) => {
            if (!draftState.mapImages[mapImageId]) {
                throw new ReducerError(
                    `MapImage with id ${mapImageId} does not exist`
                );
            }
            delete draftState.mapImages[mapImageId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const reconfigureMapImageUrl: ActionReducer<ReconfigureMapImageUrlAction> =
        {
            action: ReconfigureMapImageUrlAction,
            reducer: (draftState, { mapImageId, newUrl }) => {
                const mapImage = getMapImage(draftState, mapImageId);
                mapImage.image.url = newUrl;
                return draftState;
            },
            rights: 'trainer',
        };
}

function getMapImage(state: Mutable<ExerciseState>, mapImageId: UUID) {
    const mapImage = state.mapImages[mapImageId];
    if (!mapImage) {
        throw new ReducerError(`MapImage with id ${mapImageId} does not exist`);
    }
    return mapImage;
}
