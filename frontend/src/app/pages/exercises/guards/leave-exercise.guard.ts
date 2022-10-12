import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import { selectMode } from 'src/app/state/application/application.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

@Injectable({
    providedIn: 'root',
})
export class LeaveExerciseGuard implements CanDeactivate<unknown> {
    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ) {
        // If the client has already left the exercise, we don't need to inform the user here.
        // This should be handled by the error handler/action that lead to the leave (e.g. the exercise deletion).
        if (selectStateSnapshot(selectMode, this.store) !== 'frontPage') {
            this.apiService.leaveExercise();
            this.messageService.postMessage({
                title: 'Übung verlassen',
                body: 'Sie können der Übung über die Übungs-ID wieder beitreten.',
                color: 'info',
            });
        }
        return true;
    }
}
