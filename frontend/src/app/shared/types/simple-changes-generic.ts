import type { OnChanges } from '@angular/core';

/**
 * This is a workaround for typing support in ngOnChanges and should be used instead of SimpleChanges
 * See https://github.com/angular/angular/issues/17560
 *
 * A hashtable of changes represented by {@link SimpleChangeGeneric} objects stored
 * at the declared property name they belong to on a Directive or Component. This is
 * the type passed to the `ngOnChanges` hook.
 *
 * @see `OnChanges`
 *
 * @publicApi
 */
export type SimpleChangesGeneric<ComponentClass extends OnChanges> = {
    [PropName in keyof ComponentClass]: SimpleChangeGeneric<
        ComponentClass[PropName]
    >;
};

/**
 * This is a workaround for typing support in ngOnChanges and should be used instead of SimpleChange
 * See https://github.com/angular/angular/issues/17560
 *
 * Represents a basic change from a previous to a new value for a single
 * property on a directive instance. Passed as a value in a
 * {@link SimpleChangesGeneric} object to the `ngOnChanges` hook.
 *
 * @see `OnChanges`
 *
 * @publicApi
 */
declare class SimpleChangeGeneric<T> {
    previousValue: T;
    currentValue: T;
    firstChange: boolean;
    constructor(previousValue: T, currentValue: T, firstChange: boolean);
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange(): boolean;
}
