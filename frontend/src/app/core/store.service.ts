import { Injectable } from '@angular/core';
import type { Action, Selector } from '@ngrx/store';
// eslint-disable-next-line no-restricted-imports
import { Store } from '@ngrx/store';
import type { Observable } from 'rxjs';
import { first } from 'rxjs';
import type { AppState } from '../state/app.state';

/**
 * This service is a wrapper around the ngrx-store.
 * It changes the API to be more convenient to use for this concrete application.
 * The normal ngrx-store shouldn't be used directly. Instead, always use this service.
 */
@Injectable({
    providedIn: 'root',
})
export class StoreService {
    constructor(private readonly store: Store<AppState>) {}

    /**
     * @returns An observable that on subscription emits the selected part of the current state
     * and then emits the new state each time it changes.
     */
    public select$<T>(selector: Selector<AppState, T>): Observable<T> {
        return this.store.select(selector);
    }

    /**
     * If you want to observe the state and get notified of changes,
     * you should use {@link select$} on the store.
     *
     * @returns a synchronous snapshot of the selected part of the state.
     */
    public select<T>(selector: Selector<AppState, T>): T {
        // There is sadly currently no other way to get the state synchronously...
        let result: T;
        // "Subscribing to Store will always be guaranteed to be synchronous" - https://github.com/ngrx/platform/issues/227#issuecomment-431682349
        this.store
            .select(selector)
            .pipe(first())
            .subscribe((s) => (result = s));
        return result!;
    }

    /**
     * Dispatches an action to the ngrx-store.
     *
     * Usually you want to propose an action via the {@link ExerciseService} to the backend instead.
     */
    // TODO: The action should be a literal union of all our actions.
    // NgRx doesn't support this yet, so we will have to get creative ourselves.
    public dispatch(action: Action): void {
        this.store.dispatch(action);
    }
}
