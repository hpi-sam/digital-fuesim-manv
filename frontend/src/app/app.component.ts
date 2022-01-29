import { Component } from '@angular/core';
import type { Client } from 'digital-fuesim-manv-shared';
import {
    Patient,
    Position,
    Size,
    uuid,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from './core/api.service';
import { openClientOverviewModal } from './shared/client-overview/open-client-overview-modal';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    closeResult = '';
    public exerciseId = '';

    public clientName = '';

    public exerciseHasBeenCreated = false;

    public trainerId = '';

    public participantId = '';

    public client?: Client = undefined;

    constructor(
        public readonly apiService: ApiService,
        private readonly modalService: NgbModal
    ) {}

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

    private viewportIndex = 0;

    public async addViewport(
        viewport: Viewport = new Viewport(
            new Position(0, 0),
            new Size(0, 0),
            `Viewport ${this.viewportIndex++}`
        )
    ) {
        const response = await this.apiService.proposeAction(
            {
                type: '[Viewport] Add viewport',
                viewport,
            },
            true
        );
        if (!response.success) {
            console.error(response.message);
        }
    }

    public async joinExercise() {
        const success = await this.apiService.joinExercise(
            this.exerciseId,
            this.clientName
        );
        if (!success) {
            return;
        }
        this.client = this.apiService.client;
    }

    public async createExercise() {
        const ids = await this.apiService.createExercise();
        this.trainerId = ids.trainerId;
        this.exerciseId = this.trainerId;
        this.participantId = ids.participantId;
        this.exerciseHasBeenCreated = true;
    }

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId);
    }
}
