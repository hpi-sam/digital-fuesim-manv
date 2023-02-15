/* eslint-disable no-bitwise */
import { IsInt, Min, ValidateIf } from 'class-validator';
import hash from 'hash.js';
import { v4 } from 'uuid';
import { getCreate } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';

export class RandomState {
    @IsValue('randomState' as const)
    readonly type = 'randomState';

    @IsLiteralUnion({ 'sha256-id-ctr': true })
    readonly algo = 'sha256-id-ctr';

    @ValidateIf((o) => o.algo === 'sha256-id-ctr')
    @IsInt()
    @Min(0)
    readonly counter: number = 0;

    static readonly create = getCreate(this);
}

export function seededRandomState() {
    return RandomState.create();
}

export function nextBool(
    draftState: Mutable<ExerciseState>,
    probability: number = 0.5
): boolean {
    return nextInt(draftState, 4294967295) / 4294967296 < probability;
}

export function nextUUID(draftState: Mutable<ExerciseState>): UUID {
    return v4({
        random: advance(draftState),
    });
}

// Returns 0 to UINT32_MAX
export function nextInt(
    draftState: Mutable<ExerciseState>,
    upperBound: number
): number {
    const state = advance(draftState)
        .slice(4)
        .map((b, i) => Math.trunc(b * 256 ** i))
        .reduce((a, b) => a | b);
    return Math.trunc(state % upperBound);
}

// Returns 32 numbers from 0-255
function advance(draftState: Mutable<ExerciseState>): number[] {
    const state = draftState.randomState;

    const result = hash
        .sha256()
        .update(draftState.id)
        .update(state.counter.toString())
        .digest()
        .map((b) => b & 0xff);

    state.counter++;
    return result;
}
