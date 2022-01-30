import { Component } from '@angular/core';
import type { Client } from 'digital-fuesim-manv-shared';
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
