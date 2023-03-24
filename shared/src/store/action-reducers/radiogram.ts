import { IsUUID } from 'class-validator';
import {
    acceptRadiogram,
    markRadiogramDone,
} from '../../models/radiogram/radiogram-helpers-mutable';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class AcceptRadiogramAction implements Action {
    @IsValue('[Radiogram] Accept radiogram' as const)
    public readonly type = '[Radiogram] Accept radiogram';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class MarkDoneRadiogramAction implements Action {
    @IsValue('[Radiogram] Mark as done' as const)
    public readonly type = '[Radiogram] Mark as done';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;

    // Migration would be borderline impossible so we save it now, even if we do not need it yet
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export namespace RadiogramActionReducers {
    export const acceptRadiogramReducer: ActionReducer<AcceptRadiogramAction> =
        {
            action: AcceptRadiogramAction,
            reducer: (draftState, { radiogramId, clientId }) => {
                acceptRadiogram(draftState, radiogramId, clientId);
                return draftState;
            },
            rights: 'participant',
        };

    export const markDoneReducer: ActionReducer<MarkDoneRadiogramAction> = {
        action: MarkDoneRadiogramAction,
        reducer: (draftState, { radiogramId }) => {
            markRadiogramDone(draftState, radiogramId);
            return draftState;
        },
        rights: 'participant',
    };
}
