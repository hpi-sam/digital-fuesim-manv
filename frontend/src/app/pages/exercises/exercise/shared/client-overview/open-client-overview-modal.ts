import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientOverviewModalComponent } from './client-overview-modal/client-overview-modal.component';

export function openClientOverviewModal(
    ngbModalService: NgbModal,
    exerciseId: string
) {
    const modalRef = ngbModalService.open(ClientOverviewModalComponent, {
        size: 'lg',
    });
    const componentInstance =
        modalRef.componentInstance as ClientOverviewModalComponent;
    componentInstance.exerciseId = exerciseId;
}
