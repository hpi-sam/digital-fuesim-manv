import type { OnDestroy } from '@angular/core';
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
export class TimeTravelComponent implements OnDestroy {
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
        async (time) => {
            this.stopReplay();
            this.apiService.jumpToTime(time);
        },
        250,
        {
            trailing: true,
        }
    );

    /**
     * Whether the exercise is currently automatically replayed.
     */
    public get isReplaying() {
        return !!this.replayInterval;
    }

    // In the editor the type is 'NodeJS.Timer', when building angular it is 'number' -> https://stackoverflow.com/a/59681620
    private replayInterval?: ReturnType<typeof setInterval>;

    public startReplay() {
        this.replayInterval = setInterval(() => {
            const timeConstraints = this.apiService.timeConstraints!;
            if (timeConstraints.current >= timeConstraints.end) {
                this.stopReplay();
                return;
            }
            this.apiService.jumpToTime(
                timeConstraints.current + 1000 * this.replaySpeed
            );
        }, 1000);
    }

    public stopReplay() {
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
        }
        this.replayInterval = undefined;
    }

    public readonly replaySpeedOptions = [1, 2, 4, 8, 16];
    public replaySpeed = 1;

    public setReplaySpeed(speed: number) {
        this.replaySpeed = speed;
        if (this.isReplaying) {
            // Update the speed
            this.stopReplay();
            this.startReplay();
        }
    }

    public restartReplay() {
        this.stopReplay();
        this.apiService.jumpToTime(this.apiService.timeConstraints!.start);
        this.startReplay();
    }

    ngOnDestroy() {
        this.stopReplay();
    }
}
