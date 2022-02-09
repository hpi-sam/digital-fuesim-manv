import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
} from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class LeaveExerciseGuard implements CanDeactivate<unknown> {
    canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ) {
        // TODO: leave the exercise (with the id `currentRoute.params['exerciseId']`)
        return true;
    }
}
