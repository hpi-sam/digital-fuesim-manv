import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SimulatedRegionItemComponent } from './simulated-region-item/simulated-region-item.component';

@NgModule({
    declarations: [SimulatedRegionItemComponent],
    imports: [CommonModule, FormsModule, SharedModule, NgbNavModule],
    exports: [SimulatedRegionItemComponent],
})
export class SimulatedRegionOverviewModule {}
