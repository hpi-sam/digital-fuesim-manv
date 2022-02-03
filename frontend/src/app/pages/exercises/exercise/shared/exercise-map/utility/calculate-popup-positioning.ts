import type { Positioning } from '../../utility/types/positioning';

/**
 *
 * @param featureCenter coordinates of the feature to which the popup should belong
 * @param constraints the width and height of the feature
 * @param viewCenter the current coordinates in the center of the view
 * @returns the position and the positioning of the popup
 */
export function calculatePopupPositioning(
    featureCenter: number[],
    constraints: { width: number; height: number },
    viewCenter: number[]
): {
    position: number[];
    positioning: Positioning;
} {
    const offset = [constraints.width / 2, constraints.height / 2];
    const position = [0, 0];

    if (featureCenter[1] < viewCenter[1]) {
        position[0] = featureCenter[0];
        position[1] = featureCenter[1] + offset[1];
        return { position, positioning: 'bottom-center' };
    }

    if (
        Math.abs(featureCenter[0] - viewCenter[0]) <
        Math.abs(featureCenter[1] - viewCenter[1])
    ) {
        position[0] = featureCenter[0];
        position[1] = featureCenter[1] - offset[1];
        return { position, positioning: 'top-center' };
    }

    if (featureCenter[0] < viewCenter[0]) {
        position[0] = featureCenter[0] + offset[0];
        position[1] = featureCenter[1];
        return { position, positioning: 'center-left' };
    }

    position[0] = featureCenter[0] - offset[0];
    position[1] = featureCenter[1];
    return { position, positioning: 'center-right' };
}
