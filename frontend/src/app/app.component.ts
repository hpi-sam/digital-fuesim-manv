import { Component } from '@angular/core';
import { Patient, uuid } from 'digital-fuesim-manv-shared';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    closeResult = '';
    public exerciseId = '';

    public clientName = '';

    public isTrainer = false;

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

    public joinExercise() {
        this.apiService.joinExercise(
            this.exerciseId,
            this.clientName,
            this.isTrainer ? 'trainer' : 'participant'
        );
    }

    public async createExercise() {
        this.exerciseId = (await this.apiService.createExercise()).exerciseId;
    }

    public open(content: any) {
        this.modalService
            .open(content, { ariaLabelledBy: 'modal-basic-title' })
            .result.then(
                (result) => {
                    this.closeResult = `Closed with: ${result}`;
                },
                (reason) => {
                    this.closeResult = `Dismissed ${this.getDismissReason(
                        reason
                    )}`;
                }
            );
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        }
        return `with: ${reason}`;
    }
}
