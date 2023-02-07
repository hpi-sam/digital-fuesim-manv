import { Type } from 'class-transformer';
import { MapPosition } from '../../models/utils/position/map-position';
import type { Position } from '../../models/utils/position/position';
import { SimulatedRegionPosition } from '../../models/utils/position/simulated-region-position';
import { TransferPosition } from '../../models/utils/position/transfer-position';
import { VehiclePosition } from '../../models/utils/position/vehicle-position';
import { IsLiteralUnion } from './is-literal-union';

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
