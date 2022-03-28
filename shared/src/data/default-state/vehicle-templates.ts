import { VehicleTemplate } from '../../models';
import type { ImageProperties } from '../../models/utils/image-properties';

const defaultImage: ImageProperties = {
    url: '/assets/vehicle.svg',
    height: 200,
    aspectRatio: 1,
};

const rtwVehicleTemplate = new VehicleTemplate(
    'RTW',
    defaultImage,
    2,
    ['notSan', 'retSan'],
    {
        logicalOperator: 'or',
        green: 2,
        yellow: 1,
        red: 1,
    }
);

const gwSanVehicleTemplate = new VehicleTemplate(
    'GW-San',
    defaultImage,
    2,
    ['notSan', 'retSan', 'retSan', 'retSan'],
    {
        logicalOperator: 'and',
        green: 5,
        yellow: 4,
        red: 2,
    }
);

const nefVehicleTemplate = new VehicleTemplate(
    'NEF',
    defaultImage,
    2,
    ['notarzt', 'notSan'],
    {
        logicalOperator: 'or',
        green: 2,
        yellow: 2,
        red: 2,
    }
);

const hubschrauberVehicleTemplate = new VehicleTemplate(
    'Hubschrauber',
    defaultImage,
    1,
    ['notarzt', 'notSan'],
    {
        logicalOperator: 'or',
        green: 2,
        yellow: 1,
        red: 1,
    }
);

export const defaultVehicleTemplates: VehicleTemplate[] = [
    rtwVehicleTemplate,
    gwSanVehicleTemplate,
    nefVehicleTemplate,
    hubschrauberVehicleTemplate,
];
