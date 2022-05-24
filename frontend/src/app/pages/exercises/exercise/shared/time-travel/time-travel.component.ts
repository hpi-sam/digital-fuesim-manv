import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { throttle } from 'lodash';
import { ApiService } from 'src/app/core/api.service';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';
import { openExerciseStatisticsModal } from '../exercise-statistics/open-exercise-statistics-modal';
import { openTransferOverviewModal } from '../transfer-overview/open-transfer-overview-modal';

@Component({
    selector: 'app-time-travel',
    templateUrl: './time-travel.component.html',
    styleUrls: ['./time-travel.component.scss'],
})
export class TimeTravelComponent {
    /**
     * How much time in ms should be fast forwarded/rewound
     */
    public readonly timeStep = 10 * 1000;

    constructor(
        private readonly modalService: NgbModal,
        public readonly apiService: ApiService
    ) {}

    public openClientOverview() {
        openClientOverviewModal(this.modalService);
    }

    public openTransferOverview() {
        openTransferOverviewModal(this.modalService);
    }

    public openExerciseStatisticsModal() {
        openExerciseStatisticsModal(this.modalService);
    }

    // We don't want to make too many time jumps when dragging the slider.
    public readonly jumpToTime = throttle(
        async (time) => this.apiService.jumpToTime(time),
        250,
        {
            trailing: true,
        }
    );
}
