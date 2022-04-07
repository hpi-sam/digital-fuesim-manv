import { VehicleTemplate } from '../../models';
import type { ImageProperties } from '../../models/utils/image-properties';

const rtwImage: ImageProperties = {
    url: '/assets/rtw_vehicle.png',
    height: 100,
    aspectRatio: 3693 / 1670,
};

const ktwImage: ImageProperties = {
    url: '/assets/ktw_vehicle.png',
    height: 100,
    aspectRatio: 5046 / 2465,
};

const gwSanImage: ImageProperties = {
    url: '/assets/gwsan_vehicle.png',
    height: 120,
    aspectRatio: 5000 / 2474,
};

const nefImage: ImageProperties = {
    url: '/assets/nef_vehicle.png',
    height: 70,
    aspectRatio: 4455 / 1847,
};

const hubschrauberImage: ImageProperties = {
    url: '/assets/hubschrauber_vehicle.png',
    height: 150,
    aspectRatio: 469 / 341,
};

const rtwVehicleTemplate = new VehicleTemplate(
    'RTW',
    rtwImage,
    2,
    ['notSan', 'retSan'],
    {
        logicalOperator: 'or',
        green: 2,
        yellow: 1,
        red: 1,
    }
);

const ktwVehicleTemplate = new VehicleTemplate(
    'KTW',
    ktwImage,
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
    gwSanImage,
    0,
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
    nefImage,
    0,
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
    hubschrauberImage,
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
    ktwVehicleTemplate,
    gwSanVehicleTemplate,
    nefVehicleTemplate,
    hubschrauberVehicleTemplate,
];
