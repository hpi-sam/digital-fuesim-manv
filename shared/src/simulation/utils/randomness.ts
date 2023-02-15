/* eslint-disable no-bitwise */
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';
import { v4 } from 'uuid';
import { getCreate } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';

// 4 unsigned 32-bit integers
type Sfc32state = readonly [number, number, number, number];

export class RandomState {
    @IsValue('randomState' as const)
    readonly type = 'randomState';

    @IsLiteralUnion({ sfc32: true })
    readonly algo = 'sfc32';

    @ValidateIf((o) => o.algo === 'sfc32')
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(4294967295 /* UINT32_MAX */, { each: true })
    readonly sfc32state!: Sfc32state;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(state: Sfc32state) {
        this.sfc32state = state;
    }

    static readonly create = getCreate(this);
}

export function seededRandomState() {
    return RandomState.create(
        Array.from({ length: 4 }).map(() =>
            Math.trunc(Math.random() * 4294967295)
        ) as unknown as Sfc32state
    );
}

export function nextBool(
    draftState: Mutable<ExerciseState>,
    probability: number = 0.5
): boolean {
    return nextInt(draftState, 4294967296) / 4294967296 < probability;
}

export function nextUUID(draftState: Mutable<ExerciseState>): UUID {
    return v4({
        random: Array.from({ length: 16 }).map(() => nextInt(draftState, 256)),
    });
}

export function nextInt(
    draftState: Mutable<ExerciseState>,
    upperBound: number
): number {
    return Math.trunc(advance(draftState) % upperBound);
}

function advance(draftState: Mutable<ExerciseState>): number {
    const state = draftState.randomState;
    let [a, b, c, d] = state.sfc32state;

    // Adapted from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#sfc32
    a = Math.trunc(a);
    b = Math.trunc(b);
    c = Math.trunc(c);
    d = Math.trunc(d);
    const t = Math.trunc(Math.trunc(a + b) + d);
    d = Math.trunc(d + 1);
    a = b ^ (b >>> 9);
    b = Math.trunc(c + (c << 3));
    c = (c << 21) | (c >>> 11);
    c = Math.trunc(c + t);
    const result = t >>> 0;
    state.sfc32state = [a, b, c, d];

    return result;
}
