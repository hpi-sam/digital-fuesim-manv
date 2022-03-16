import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
} from '@angular/router';
import { ApiService } from 'src/app/core/api.service';

@Injectable({
    providedIn: 'root',
})
export class LeaveExerciseGuard implements CanDeactivate<unknown> {
    constructor(private readonly apiService: ApiService) {}

    canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ) {
        this.apiService.leaveExercise();
        return true;
    }
}
