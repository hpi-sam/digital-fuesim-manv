import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { escapeRegExp } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';
import { ExerciseImportService } from 'src/app/core/exercise-import.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    public exerciseId = '';

    constructor(
        private readonly router: Router,
        public readonly importService: ExerciseImportService
    ) {}

    ngOnDestroy() {
        this.destroy$.next();
    }

    ngOnInit() {
        this.importService.ids$
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ trainerId }) => (this.exerciseId = trainerId));
    }

    public async createExercise() {
        await this.importService.createExercise();
    }

    public async importExerciseState(fileList: FileList) {
        await this.importService.importExercise(fileList.item(0));
    }

    public pasteExerciseId(event: ClipboardEvent) {
        const pastedText = event.clipboardData?.getData('text') ?? '';
        const joinUrl = new RegExp(
            `^${escapeRegExp(location.origin)}/exercises/(\\d{6,8})$`,
            'u'
        );

        const matches = joinUrl.exec(pastedText);
        if (matches?.[1]) {
            this.exerciseId = matches[1];
            event.preventDefault();
        }
    }

    public joinExercise() {
        this.router.navigate(['/exercises', this.exerciseId]);
    }
}
