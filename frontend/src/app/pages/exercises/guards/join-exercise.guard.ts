import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { StoreService } from 'src/app/core/store.service';
import { selectExerciseStateMode } from 'src/app/state/application/selectors/application.selectors';
import { tryToJoinExercise } from '../shared/join-exercise-modal/try-to-join-exercise';

@Injectable({
    providedIn: 'root',
})
export class JoinExerciseGuard implements CanActivate {
    constructor(
        private readonly ngbModalService: NgbModal,
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly storeService: StoreService,
        private readonly messageService: MessageService
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        if (this.storeService.select(selectExerciseStateMode) === 'exercise') {
            return true;
        }
        const exerciseExists = await this.apiService.exerciseExists(
            route.params['exerciseId']
        );
        if (!exerciseExists) {
            this.messageService.postMessage({
                title: 'Diese Übung existiert nicht',
                color: 'danger',
            });
            this.router.navigate(['/']);
            return false;
        }

        const successfullyJoined = await tryToJoinExercise(
            this.ngbModalService,
            route.params['exerciseId']
        );
        if (!successfullyJoined) {
            this.router.navigate(['/']);
        }
        return successfullyJoined;
    }
}
