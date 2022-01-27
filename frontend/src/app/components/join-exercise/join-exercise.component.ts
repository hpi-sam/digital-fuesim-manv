import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';

@Component({
    selector: 'app-join-exercise',
    templateUrl: './join-exercise.component.html',
    styleUrls: ['./join-exercise.component.scss'],
})
export class JoinExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();
    public exerciseId = '';
    public clientName = '';
    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params
            .pipe(takeUntil(this.destroy))
            .subscribe((params) => {
                this.exerciseId = params['exerciseId'] as string;
            });
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }

    public async joinExercise() {
        const joinSuccess = await this.apiService.joinExercise(
            this.exerciseId,
            this.clientName
        );
        if (joinSuccess) {
            this.router.navigate(['/']);
        }
    }
}
