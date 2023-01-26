import { Type } from 'class-transformer';
import { MapPosition } from '../../models/utils/map-position';
import type { MetaPosition } from '../../models/utils/meta-position';
import { SimulatedRegionPosition } from '../../models/utils/simulated-region-position';
import { TransferPosition } from '../../models/utils/transfer-position';
import { VehiclePosition } from '../../models/utils/vehicle-position';
import { IsLiteralUnion } from './is-literal-union';

class MetaPositionBase {
    @IsLiteralUnion<MetaPosition['type']>({
        coordinates: true,
        simulatedRegion: true,
        transfer: true,
        vehicle: true,
    })
    public type: MetaPosition['type'];

    constructor(type: MetaPosition['type']) {
        this.type = type;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsMetaPosition = () =>
    Type(() => MetaPositionBase, {
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
