import { MapImageTemplate } from '../../models/map-image-template';
import { ImageProperties } from '../../models/utils';

const fireMapImageTemplate = MapImageTemplate.create(
    'Feuer',
    ImageProperties.create('/assets/fire.svg', 427, 313 / 427)
);

const houseFireMapImageTemplate = MapImageTemplate.create(
    'Brennendes Haus',
    ImageProperties.create('/assets/house-fire.svg', 623, 393 / 623)
);

export const defaultMapImagesTemplates: readonly MapImageTemplate[] = [
    fireMapImageTemplate,
    houseFireMapImageTemplate,
];
