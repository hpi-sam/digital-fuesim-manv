import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Injectable({
    providedIn: 'root',
})
export class ConfirmationModalService {
    constructor(private readonly ngbModalService: NgbModal) {}

    public async confirm(options: ConfirmationOptions) {
        const modalRef = this.ngbModalService.open(ConfirmationModalComponent);
        const componentInstance =
            modalRef.componentInstance as ConfirmationModalComponent;
        componentInstance.title = options.title;
        componentInstance.description = options.description;
        componentInstance.confirmationString = options.confirmationString;
        return firstValueFrom(componentInstance.confirmation$, {
            defaultValue: false,
        });
    }
}

export interface ConfirmationOptions {
    title: string;
    description: string;
    confirmationString?: string;
}
