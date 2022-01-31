import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Patient, uuid } from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectClient } from 'src/app/state/exercise/exercise.selectors';
import { openClientOverviewModal } from '../shared/client-overview/open-client-overview-modal';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();
    public exerciseId?: string;

    public client$ = this.store.select((state: AppState) =>
        selectClient(state, this.apiService.ownClientId!)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params
            .pipe(takeUntil(this.destroy))
            .subscribe((params) => {
                this.exerciseId = params['exerciseId'] as string;
            });
    }

    // Action
    public async addPatient(
        patient: Patient = new Patient(
            { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
            'green',
            'green',
            Date.now().toString()
        )
    ) {
        patient.vehicleId = uuid();
        const response = await this.apiService.proposeAction(
            {
                type: '[Patient] Add patient',
                patient,
            },
            true
        );
        if (!response.success) {
            console.error(response.message);
        }
    }

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId!);
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
