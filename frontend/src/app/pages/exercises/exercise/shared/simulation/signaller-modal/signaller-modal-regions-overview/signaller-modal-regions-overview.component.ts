import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AssignLeaderBehaviorState } from 'digital-fuesim-manv-shared';
import { personnelTypeNames } from 'digital-fuesim-manv-shared';
import { combineLatest, map, type Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    selectPersonnel,
    selectSimulatedRegions,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-signaller-modal-regions-overview',
    templateUrl: './signaller-modal-regions-overview.component.html',
    styleUrls: ['./signaller-modal-regions-overview.component.scss'],
})
export class SignallerModalRegionsOverviewComponent implements OnInit {
    regions$!: Observable<
        (
            | {
                  name: string;
                  hasLeader: false;
              }
            | {
                  name: string;
                  hasLeader: true;
                  leaderName: string;
                  leaderVehicleName: string;
              }
        )[]
    >;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit() {
        const simulatedRegions$ = this.store.select(selectSimulatedRegions);
        const personnel$ = this.store.select(selectPersonnel);

        // @ts-expect-error Typescript does not detect the return type of `regions.sort` correctly, so the assignment to `this.regions$` would fail
        this.regions$ = combineLatest([simulatedRegions$, personnel$]).pipe(
            map(([simulatedRegions, personnel]) =>
                Object.values(simulatedRegions).map((simulatedRegion) => {
                    const assignLeaderBehavior = simulatedRegion.behaviors.find(
                        (behavior) => behavior.type === 'assignLeaderBehavior'
                    ) as AssignLeaderBehaviorState | undefined;

                    if (!assignLeaderBehavior?.leaderId) {
                        return { name: simulatedRegion.name, hasLeader: false };
                    }

                    const leader = personnel[assignLeaderBehavior.leaderId];

                    if (!leader) {
                        return { name: simulatedRegion.name, hasLeader: false };
                    }

                    return {
                        name: simulatedRegion.name,
                        hasLeader: true,
                        leaderName: personnelTypeNames[leader.personnelType],
                        leaderVehicleName: leader.vehicleName,
                    };
                })
            ),
            map((regions) =>
                regions.sort((a, b) => a.name.localeCompare(b.name))
            )
        );
    }
}
