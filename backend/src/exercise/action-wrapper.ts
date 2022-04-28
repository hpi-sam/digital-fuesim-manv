import type { ExerciseAction, UUID } from 'digital-fuesim-manv-shared';

export interface ActionEmitter {
    emitterId: UUID | 'server';
    /**
     * `undefined` iff {@link emitterId}` === 'server'`
     */
    emitterName?: string;
}

export class ActionWrapper {
    public readonly emitter: ActionEmitter;

    public readonly action: ExerciseAction;

    public constructor(emitter: ActionEmitter, action: ExerciseAction) {
        this.emitter = emitter;
        this.action = action;
    }
}
