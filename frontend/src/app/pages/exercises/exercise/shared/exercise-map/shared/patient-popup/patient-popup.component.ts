import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Patient, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';

@Component({
    selector: 'app-patient-popup',
    templateUrl: './patient-popup.component.html',
    styleUrls: ['./patient-popup.component.scss'],
})
export class PatientPopupComponent implements OnInit {
    // These properties are only set after OnInit
    public patientId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public patient$?: Observable<Patient>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.patient$ = this.store.select(
            (state) => state.exercise.patients[this.patientId]
        );
    }
}
