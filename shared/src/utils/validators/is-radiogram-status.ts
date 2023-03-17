import { Type } from 'class-transformer';
import { RadiogramAcceptedStatus } from '../../models/utils/radiogram-status/radiogram-accepted-status';
import { RadiogramDoneStatus } from '../../models/utils/radiogram-status/radiogram-done-status';
import type { RadiogramStatus } from '../../models/utils/radiogram-status/radiogram-status';
import { RadiogramUnreadStatus } from '../../models/utils/radiogram-status/radiogram-unread-status';
import { IsLiteralUnion } from './is-literal-union';

class RadiogramStatusBase {
    @IsLiteralUnion<RadiogramStatus['type']>({
        unread: true,
        accepted: true,
        done: true,
    })
    public type: RadiogramStatus['type'];

    constructor(type: RadiogramStatus['type']) {
        this.type = type;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsRadiogramStatus = () =>
    Type(() => RadiogramStatusBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: [
                { name: 'unread', value: RadiogramUnreadStatus },
                { name: 'accepted', value: RadiogramAcceptedStatus },
                { name: 'done', value: RadiogramDoneStatus },
            ],
        },
    });
