import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import type { UUID } from 'digital-fuesim-manv-shared';
import { SignallerModalComponent } from './signaller-modal/signaller-modal.component';

export function openSimulationSignallerModal(
    ngbModalService: NgbModal,
    simulatedRegionId?: UUID
) {
    const modalRef = ngbModalService.open(SignallerModalComponent, {
        fullscreen: true,
        keyboard: false,
    });

    if (simulatedRegionId) {
        (
            modalRef.componentInstance as SignallerModalComponent
        ).currentSimulatedRegionId = simulatedRegionId;
    }
}
