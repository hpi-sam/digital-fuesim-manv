import type { Store } from '@ngrx/store';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectClient } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

/**
 *
 * @returns Whether the user is a trainer. You can expect this to not change during the exercise.
 */
export function isTrainer(
    apiService: ApiService,
    store: Store<AppState>
): boolean {
    return (
        getSelectClient(apiService.ownClientId!)(getStateSnapshot(store))
            .role === 'trainer'
    );
}
