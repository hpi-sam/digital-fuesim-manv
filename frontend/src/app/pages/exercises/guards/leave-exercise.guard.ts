import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
} from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';

@Injectable({
    providedIn: 'root',
})
export class LeaveExerciseGuard implements CanDeactivate<unknown> {
    constructor(
        private readonly apiService: ApiService,
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
        if (this.apiService.isJoined) {
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
