import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import type { ReportableInformation, UUID } from 'digital-fuesim-manv-shared';
import { SignallerModalRecurringReportModalComponent } from './signaller-modal-recurring-report-modal/signaller-modal-recurring-report-modal.component';

export function openSimulationSignallerModalRecurringReportModal(
    ngbModalService: NgbModal,
    simulatedRegionId: UUID,
    reportableInformation: ReportableInformation
) {
    const component = ngbModalService.open(
        SignallerModalRecurringReportModalComponent,
        {
            size: 'm',
        }
    ).componentInstance as SignallerModalRecurringReportModalComponent;

    component.simulatedRegionId = simulatedRegionId;
    component.reportableInformation = reportableInformation;
}
