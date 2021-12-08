import { Viewport } from 'digital-fuesim-manv-shared';

export namespace ExerciseActions {
    export class AddViewport {
        static readonly type = '[API] Add viewport';

        constructor(public viewport: Viewport) {}
    }
}
