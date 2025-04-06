import { Type } from 'class-transformer';
import { MapPosition } from '../../models/utils/position/map-position.js';
import type { Position } from '../../models/utils/position/position.js';
import { SimulatedRegionPosition } from '../../models/utils/position/simulated-region-position.js';
import { TransferPosition } from '../../models/utils/position/transfer-position.js';
import { VehiclePosition } from '../../models/utils/position/vehicle-position.js';
import { IsLiteralUnion } from './is-literal-union.js';

class PositionBase {
    @IsLiteralUnion<Position['type']>({
        coordinates: true,
        simulatedRegion: true,
        transfer: true,
        vehicle: true,
    })
    public type: Position['type'];

    constructor(type: Position['type']) {
        this.type = type;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsPosition = () =>
    Type(() => PositionBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: [
                { name: 'coordinates', value: MapPosition },
                { name: 'simulatedRegion', value: SimulatedRegionPosition },
                { name: 'transfer', value: TransferPosition },
                { name: 'vehicle', value: VehiclePosition },
            ],
        },
    });
