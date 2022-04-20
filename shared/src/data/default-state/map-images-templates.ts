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

const carCrashMapImageTemplate = MapImageTemplate.create(
    'Autounfall',
    ImageProperties.create('/assets/car-crash.svg', 512, 640 / 512)
);

export const defaultMapImagesTemplates: readonly MapImageTemplate[] = [
    fireMapImageTemplate,
    houseFireMapImageTemplate,
    carCrashMapImageTemplate,
];
