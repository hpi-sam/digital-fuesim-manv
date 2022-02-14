import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'src/app/core/messages/message.service';
import { tryToJoinExercise } from '../shared/join-exercise-modal/try-to-join-exercise';

@Injectable({
    providedIn: 'root',
})
export class JoinExerciseGuard implements CanActivate {
    constructor(
        private readonly ngbModalService: NgbModal,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        const successfullyJoined = await tryToJoinExercise(
            this.ngbModalService,
            route.params['exerciseId']
        );
        if (!successfullyJoined) {
            this.messageService.postMessage({
                title: 'Fehler beim Beitreten der Übung',
                body: 'Die Übung konnte nicht erfolgreich betreten werden.',
                color: 'warning',
            });
            this.router.navigate(['/']);
        }
        // TODO: check if the user is already in the exercise
        return successfullyJoined;
    }
}
