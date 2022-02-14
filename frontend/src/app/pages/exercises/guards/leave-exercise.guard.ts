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
        this.messageService.postMessage({
            title: 'Übung verlassen',
            body: 'Sie können der Übung über die Übungs-ID wieder beitreten.',
            color: 'info',
        });
        this.apiService.leaveExercise();
        return true;
    }
}
