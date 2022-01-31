import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { Personell, Position } from 'digital-fuesim-manv-shared';
import { uuid } from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectClient } from 'src/app/state/exercise/exercise.selectors';
import { openClientOverviewModal } from '../shared/client-overview/open-client-overview-modal';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();
    public exerciseId?: string;

    public client$ = this.store.select((state: AppState) =>
        selectClient(state, this.apiService.ownClientId!)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params
            .pipe(takeUntil(this.destroy))
            .subscribe((params) => {
                this.exerciseId = params['exerciseId'] as string;
            });
        this.client$.pipe(takeUntil(this.destroy)).subscribe((client) => {
            // this enables remote control of the dummy clients via the client overview
            this.isDummyClient = client.isInWaitingRoom;
        });
    }

    public automatedActionSender?: AutomatedActionSender;
    get isDummyClient() {
        return !!this.automatedActionSender;
    }
    set isDummyClient(activate: boolean) {
        if (activate) {
            this.automatedActionSender = new AutomatedActionSender(
                this.apiService
            );
        } else {
            this.automatedActionSender?.destroy();
            this.automatedActionSender = undefined;
        }
    }

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId!);
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }
}

class AutomatedActionSender {
    private readonly personellId = uuid();
    private readonly movementBounds = {
        x: { min: 1460358, max: 1460535 },
        y: { min: 6871682, max: 6871759 },
    };
    private readonly initialPosition: Position = {
        x: (this.movementBounds.x.min + this.movementBounds.x.max) / 2,
        y: (this.movementBounds.y.min + this.movementBounds.y.max) / 2,
    };
    private readonly movementDistance = 20;
    private readonly actionTimeout = 1000;
    private actionIntervall?: number;

    constructor(private readonly apiService: ApiService) {
        this.start();
    }

    private async start() {
        await this.createPersonell();
        this.actionIntervall = setInterval(() => {
            this.movePersonell();
        }, this.actionTimeout);
    }

    private async createPersonell() {
        const newPersonell: Personell = {
            id: this.personellId,
            assignedPatientIds: {},
            personellType: 'firefighter',
            vehicleId: uuid(),
            position: this.initialPosition,
        };
        await this.apiService.proposeAction({
            type: '[Personell] Add personell',
            personell: newPersonell,
        });
    }

    private movePersonell() {
        this.apiService.proposeAction({
            type: '[Personell] Move personell',
            personellId: this.personellId,
            targetPosition: this.getNextTargetPosition(),
        });
    }

    private currentPosition = this.initialPosition;
    private getNextTargetPosition(): Position {
        const targetPosition: Position = {
            x:
                this.currentPosition.x +
                this.calculateMovement(
                    this.movementBounds.x.min,
                    this.movementBounds.x.max,
                    this.currentPosition.x
                ),
            y:
                this.currentPosition.y +
                this.calculateMovement(
                    this.movementBounds.y.min,
                    this.movementBounds.y.max,
                    this.currentPosition.y
                ),
        };
        this.currentPosition = targetPosition;
        return targetPosition;
    }

    private calculateMovement(min: number, max: number, current: number) {
        const movement =
            Math.random() * this.movementDistance - this.movementDistance / 2;
        if (current + movement > max) {
            return -movement;
        }
        if (current + movement < min) {
            return movement;
        }
        return movement;
    }

    public destroy() {
        clearInterval(this.actionIntervall as any);
    }
}
