import { MapImageTemplate } from '../../models/map-image-template';
import { ImageProperties } from '../../models/utils';

const mapImageDefaultTemplate = MapImageTemplate.create(
    'Bild',
    ImageProperties.create('/assets/map-image-sample.webp', 256, 256 / 256)
);

export const defaultMapImagesTemplates: readonly MapImageTemplate[] = [
    mapImageDefaultTemplate,
];
