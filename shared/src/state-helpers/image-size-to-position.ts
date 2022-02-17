/**
 *
 * @param imageSizeInPixel The size of an image in pixels at zoom 23 in openLayers
 * @returns the length in coordinates
 */
export function imageSizeToPosition(imageSizeInPixel: number) {
    // TODO: this is determined via best effort
    return (imageSizeInPixel / 200) * 7;
}
