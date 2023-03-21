import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { Hospital } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectHospital } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-hospital-name',
    templateUrl: './hospital-name.component.html',
    styleUrls: ['./hospital-name.component.scss'],
})
export class HospitalNameComponent implements OnChanges {
    @Input() hospitalId!: UUID;

    public hospital$?: Observable<Hospital>;

    constructor(private readonly storeService: StoreService) {}

    ngOnChanges() {
        this.hospital$ = this.storeService.select$(
            createSelectHospital(this.hospitalId)
        );
    }
}
