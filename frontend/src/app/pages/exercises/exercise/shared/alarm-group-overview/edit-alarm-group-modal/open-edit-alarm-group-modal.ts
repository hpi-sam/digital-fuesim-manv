import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import type { UUID } from 'digital-fuesim-manv-shared';
import { EditAlarmGroupModalComponent } from './edit-alarm-group-modal.component';

export async function openEditAlarmGroupModal(
    ngbModalService: NgbModal,
    alarmGroupId: UUID
) {
    const modalRef = ngbModalService.open(EditAlarmGroupModalComponent);
    const componentInstance =
        modalRef.componentInstance as EditAlarmGroupModalComponent;
    componentInstance.alarmGroupId = alarmGroupId;
}
