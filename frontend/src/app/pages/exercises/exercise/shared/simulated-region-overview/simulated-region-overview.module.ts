import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SimulatedRegionOverviewGeneralComponent } from './simulated-region-overview-general/simulated-region-overview-general.component';

@NgModule({
    declarations: [SimulatedRegionOverviewGeneralComponent],
    imports: [CommonModule, FormsModule, SharedModule, NgbNavModule],
    exports: [SimulatedRegionOverviewGeneralComponent],
})
export class SimulatedRegionOverviewModule {}
