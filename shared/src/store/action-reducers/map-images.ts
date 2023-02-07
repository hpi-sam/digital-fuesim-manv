import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { MapImage } from '../../models';
import { MapPosition, MapCoordinates } from '../../models/utils';
import { changePosition } from '../../models/utils/position/position-helpers-mutable';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import {
    assertExhaustiveness,
    cloneDeepMutable,
    UUID,
    uuidValidationOptions,
} from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

export class AddMapImageAction implements Action {
    @IsValue('[MapImage] Add MapImage' as const)
    public readonly type = '[MapImage] Add MapImage';

    @ValidateNested()
    @Type(() => MapImage)
    public readonly mapImage!: MapImage;
}

export class MoveMapImageAction implements Action {
    @IsValue('[MapImage] Move MapImage' as const)
    public readonly type = '[MapImage] Move MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @ValidateNested()
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
}

export class ScaleMapImageAction implements Action {
    @IsValue('[MapImage] Scale MapImage' as const)
    public readonly type = '[MapImage] Scale MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public readonly newHeight?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public readonly newAspectRatio?: number;
}

export class RemoveMapImageAction implements Action {
    @IsValue('[MapImage] Remove MapImage' as const)
    public readonly type = '[MapImage] Remove MapImage';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;
}

export class SetIsLockedMapImageAction implements Action {
    @IsValue('[MapImage] Set isLocked' as const)
    public readonly type = '[MapImage] Set isLocked';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @IsBoolean()
    public readonly newLocked!: boolean;
}

export class ReconfigureMapImageUrlAction implements Action {
    @IsValue('[MapImage] Reconfigure Url' as const)
    public readonly type = '[MapImage] Reconfigure Url';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    /**
     * Data URI or URL of new image
     */
    @IsString()
    public readonly newUrl!: string;
}

type ChangeZIndexActionMode =
    | 'bringToBack'
    | 'bringToFront'
    | 'oneLayerBack'
    | 'oneLayerForward';

export class ChangeZIndexMapImageAction implements Action {
    @IsValue('[MapImage] Change zIndex' as const)
    public readonly type = '[MapImage] Change zIndex';

    @IsUUID(4, uuidValidationOptions)
    public readonly mapImageId!: UUID;

    @IsLiteralUnion({
        bringToBack: true,
        bringToFront: true,
        oneLayerBack: true,
        oneLayerForward: true,
    })
    public readonly mode!: ChangeZIndexActionMode;
}

export namespace MapImagesActionReducers {
    export const addMapImage: ActionReducer<AddMapImageAction> = {
        action: AddMapImageAction,
        reducer: (draftState, { mapImage }) => {
            const newMapImage = cloneDeepMutable(mapImage);
            const allZIndices = getAllZIndices(draftState);
            newMapImage.zIndex =
                allZIndices.length === 0 ? 0 : Math.max(...allZIndices) + 1;
            draftState.mapImages[mapImage.id] = newMapImage;
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveMapImage: ActionReducer<MoveMapImageAction> = {
        action: MoveMapImageAction,
        reducer: (draftState, { mapImageId, targetPosition }) => {
            const mapImage = getElement(draftState, 'mapImage', mapImageId);
            changePosition(
                mapImage,
                MapPosition.create(targetPosition),
                draftState
            );
            return draftState;
        },
        rights: 'trainer',
    };

    export const scaleMapImage: ActionReducer<ScaleMapImageAction> = {
        action: ScaleMapImageAction,
        reducer: (draftState, { mapImageId, newHeight, newAspectRatio }) => {
            const mapImage = getElement(draftState, 'mapImage', mapImageId);
            if (newHeight) {
                mapImage.image.height = newHeight;
            }
            if (newAspectRatio) {
                mapImage.image.aspectRatio = newAspectRatio;
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeMapImage: ActionReducer<RemoveMapImageAction> = {
        action: RemoveMapImageAction,
        reducer: (draftState, { mapImageId }) => {
            getElement(draftState, 'mapImage', mapImageId);
            delete draftState.mapImages[mapImageId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const reconfigureMapImageUrl: ActionReducer<ReconfigureMapImageUrlAction> =
        {
            action: ReconfigureMapImageUrlAction,
            reducer: (draftState, { mapImageId, newUrl }) => {
                const mapImage = getElement(draftState, 'mapImage', mapImageId);
                mapImage.image.url = newUrl;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setLockedMapImage: ActionReducer<SetIsLockedMapImageAction> = {
        action: SetIsLockedMapImageAction,
        reducer: (draftState, { mapImageId, newLocked }) => {
            const mapImage = getElement(draftState, 'mapImage', mapImageId);
            mapImage.isLocked = newLocked;
            return draftState;
        },
        rights: 'trainer',
    };

    export const changeZIndex: ActionReducer<ChangeZIndexMapImageAction> = {
        action: ChangeZIndexMapImageAction,
        reducer: (draftState, { mapImageId, mode }) => {
            const mapImage = getElement(draftState, 'mapImage', mapImageId);
            switch (mode) {
                case 'bringToFront':
                case 'bringToBack': {
                    const otherZIndices = getAllZIndices(
                        draftState,
                        mapImageId
                    );
                    if (otherZIndices.length === 0) {
                        mapImage.zIndex = 0;
                        break;
                    }
                    mapImage.zIndex =
                        mode === 'bringToFront'
                            ? Math.max(...otherZIndices) + 1
                            : Math.min(...otherZIndices) - 1;
                    break;
                }
                case 'oneLayerForward':
                case 'oneLayerBack':
                    mapImage.zIndex += mode === 'oneLayerForward' ? 1 : -1;
                    break;
                default:
                    assertExhaustiveness(mode);
            }
            return draftState;
        },
        rights: 'trainer',
    };
}

/**
 * @returns the zIndices of all mapImages except {@link mapImageIdToSkip}
 */
function getAllZIndices(
    exerciseState: Mutable<ExerciseState>,
    mapImageIdToSkip?: UUID
): number[] {
    return Object.values(exerciseState.mapImages)
        .filter(
            (mapImage) =>
                mapImageIdToSkip === undefined ||
                mapImage.id !== mapImageIdToSkip
        )
        .map((mapImage) => mapImage.zIndex);
}
