import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import type { UUID } from 'digital-fuesim-manv-shared';
import { EditAlarmGroupVehicleModalComponent } from './edit-alarm-group-vehicle-modal.component';

export async function openEditAlarmGroupVehicleModal(
    ngbModalService: NgbModal,
    alarmGroupId: UUID,
    alarmGroupVehicleId: UUID
) {
    const modalRef = ngbModalService.open(EditAlarmGroupVehicleModalComponent);
    const componentInstance =
        modalRef.componentInstance as EditAlarmGroupVehicleModalComponent;
    componentInstance.alarmGroupId = alarmGroupId;
    componentInstance.alarmGroupVehicleId = alarmGroupVehicleId;
}
