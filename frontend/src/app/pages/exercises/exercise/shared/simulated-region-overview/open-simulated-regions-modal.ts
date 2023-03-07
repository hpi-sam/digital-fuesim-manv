import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SimulatedRegionsModalComponent } from './simulated-regions-modal/simulated-regions-modal.component';

export function openSimulatedRegionsModal(ngbModalService: NgbModal) {
    ngbModalService.open(SimulatedRegionsModalComponent, {
        size: 'xl',
    });
}
