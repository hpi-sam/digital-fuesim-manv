import { VehicleTemplate } from '..';

const rtwVehicleTemplate = new VehicleTemplate(
    'RTW',
    '/assets/vehicle.svg',
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
    '/assets/vehicle.svg',
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
    '/assets/vehicle.svg',
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
    '/assets/vehicle.svg',
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
