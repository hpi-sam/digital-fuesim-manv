import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';

@Injectable()
export class SelectPatientService {
    public readonly patientSelected = new Subject<UUID>();

    // private _selectedPatientId?: UUID;

    // get selectedPatientId(): UUID {
    //     return this.selectedPatientId;
    // }

    public selectPatient(id: UUID) {
        this.patientSelected.next(id);
    }
}
