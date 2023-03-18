import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { Personnel } from 'digital-fuesim-manv-shared';
import { AssignLeaderBehaviorState } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectPersonnel } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-behavior-assign-leader',
    templateUrl:
        './simulated-region-overview-behavior-assign-leader.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-assign-leader.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorAssignLeaderComponent
    implements OnChanges
{
    @Input()
    assignLeaderBehaviorState!: AssignLeaderBehaviorState;

    currentLeader?: Observable<Personnel>;

    constructor(private readonly storeService: StoreService) {}

    ngOnChanges(): void {
        this.currentLeader = this.assignLeaderBehaviorState.leaderId
            ? this.storeService.select$(
                  createSelectPersonnel(this.assignLeaderBehaviorState.leaderId)
              )
            : undefined;
    }
}
