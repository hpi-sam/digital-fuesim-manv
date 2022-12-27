import { IsString, MaxLength } from 'class-validator';
import { EocLogEntry } from '../../models';
import { cloneDeepMutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class AddLogEntryAction implements Action {
    @IsValue('[Emergency Operation Center] Add Log Entry' as const)
    public readonly type = '[Emergency Operation Center] Add Log Entry';
    @IsString()
    @MaxLength(255)
    public readonly name!: string;
    @IsString()
    @MaxLength(65535)
    public readonly message!: string;
}

export namespace EmergencyOperationCenterActionReducers {
    export const addLogEntry: ActionReducer<AddLogEntryAction> = {
        action: AddLogEntryAction,
        reducer: (draftState, { name, message }) => {
            const logEntry = EocLogEntry.create(
                draftState.currentTime,
                message,
                name
            );
            draftState.eocLog.push(cloneDeepMutable(logEntry));
            return draftState;
        },
        rights: 'trainer',
    };
}
