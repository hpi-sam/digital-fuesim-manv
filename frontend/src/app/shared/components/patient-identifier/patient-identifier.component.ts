import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Patient } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectPatient } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-patient-identifier',
    templateUrl: './patient-identifier.component.html',
    styleUrls: ['./patient-identifier.component.scss'],
})
export class PatientIdentifierComponent implements OnInit {
    @Input() patientId!: UUID;

    patient$!: Observable<Patient>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.patient$ = this.store.select(createSelectPatient(this.patientId));
    }
}
