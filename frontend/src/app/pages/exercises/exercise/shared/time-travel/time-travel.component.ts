import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeepMutable, StateExport } from 'digital-fuesim-manv-shared';
import { throttle } from 'lodash-es';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { StoreService } from 'src/app/core/store.service';
import { TimeTravelService } from 'src/app/core/time-travel.service';
import { selectTimeConstraints } from 'src/app/state/application/selectors/application.selectors';
import { selectExerciseState } from 'src/app/state/application/selectors/exercise.selectors';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';
import { openExerciseStatisticsModal } from '../exercise-statistics/open-exercise-statistics-modal';
import { openTransferOverviewModal } from '../transfer-overview/open-transfer-overview-modal';

@Component({
    selector: 'app-time-travel',
    templateUrl: './time-travel.component.html',
    styleUrls: ['./time-travel.component.scss'],
})
export class TimeTravelComponent implements OnDestroy {
    public timeConstraints$ = this.storeService.select$(selectTimeConstraints);

    constructor(
        private readonly modalService: NgbModal,
        private readonly apiService: ApiService,
        private readonly timeTravelService: TimeTravelService,
        private readonly storeService: StoreService,
        private readonly messageService: MessageService
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
            this.timeTravelService.jumpToTime(time);
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
        return this.replayInterval !== undefined;
    }

    // In the editor the type is 'NodeJS.Timer', when building angular it is 'number' -> https://stackoverflow.com/a/59681620
    private replayInterval?: ReturnType<typeof setInterval>;

    public startReplay() {
        this.replayInterval = setInterval(() => {
            const timeConstraints = this.storeService.select(
                selectTimeConstraints
            )!;
            if (timeConstraints.current >= timeConstraints.end) {
                this.stopReplay();
                return;
            }
            this.timeTravelService.jumpToTime(
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
    public replaySpeed = this.replaySpeedOptions[0]!;

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
        const timeConstraints = this.storeService.select(
            selectTimeConstraints
        )!;
        this.timeTravelService.jumpToTime(timeConstraints!.start);
        this.startReplay();
    }

    public async createNewExerciseFromTheCurrentState() {
        const currentExerciseState =
            this.storeService.select(selectExerciseState);
        const { trainerId } = await this.apiService.importExercise(
            new StateExport(cloneDeepMutable(currentExerciseState))
        );
        this.messageService.postMessage({
            color: 'success',
            title: 'Neue Übung erstellt',
            body: `ÜbungsleiterId: ${trainerId}`,
        });
        window
            .open(`${location.origin}/exercises/${trainerId}`, '_blank')
            ?.focus();
    }

    ngOnDestroy() {
        this.stopReplay();
    }
}
