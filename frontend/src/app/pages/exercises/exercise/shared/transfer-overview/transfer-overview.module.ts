import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransferOverviewModalComponent } from './transfer-overview-modal/transfer-overview-modal.component';
import { TransferOverviewTableComponent } from './transfer-overview-table/transfer-overview-table.component';

@NgModule({
    declarations: [
        TransferOverviewModalComponent,
        TransferOverviewTableComponent,
    ],
    imports: [CommonModule, SharedModule],
})
export class TransferOverviewModule {}
