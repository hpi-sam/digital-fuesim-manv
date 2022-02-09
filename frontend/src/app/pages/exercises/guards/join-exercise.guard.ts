import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { tryToJoinExercise } from '../shared/join-exercise-modal/try-to-join-exercise';

@Injectable({
    providedIn: 'root',
})
export class JoinExerciseGuard implements CanActivate {
    constructor(
        private readonly ngbModalService: NgbModal,
        private readonly router: Router
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
            this.router.navigate(['/']);
        }
        // TODO: check if the user is already in the exercise
        return successfullyJoined;
    }
}
