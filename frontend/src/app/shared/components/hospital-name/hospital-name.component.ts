import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Hospital } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { getSelectHospital } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-hospital-name',
    templateUrl: './hospital-name.component.html',
    styleUrls: ['./hospital-name.component.scss'],
})
export class HospitalNameComponent implements OnChanges {
    @Input() hospitalId!: UUID;

    public hospital$?: Observable<Hospital>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnChanges() {
        this.hospital$ = this.store.select(getSelectHospital(this.hospitalId));
    }
}
