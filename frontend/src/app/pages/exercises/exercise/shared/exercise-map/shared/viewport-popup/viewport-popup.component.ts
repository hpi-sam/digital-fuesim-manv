import type { OnDestroy, OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    PatientStatus,
    PersonnelType,
    UUID,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { personnelTypeNames, statusNames } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectViewport,
    getSelectViewportMetadata,
} from 'src/app/state/exercise/exercise.selectors';

export interface ViewportMetadata {
    patients: {
        [status in PatientStatus]: { walkable: number; nonWalkable: number };
    };
    vehicles: {
        [type: string]: number;
    };
    materials: number;
    personnel: {
        [type in PersonnelType]: number;
    };
}

/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: 'info' | 'settings';

@Component({
    selector: 'app-viewport-popup',
    templateUrl: './viewport-popup.component.html',
    styleUrls: ['./viewport-popup.component.scss'],
})
export class ViewportPopupComponent implements OnInit, OnDestroy {
    // These properties are only set after OnInit
    public viewportId!: UUID;
    private readonly destroy$ = new Subject<void>();

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: 'info' | 'settings') {
        activeNavId = value;
    }

    @Output() readonly closePopup = new EventEmitter<void>();

    public viewport$?: Observable<Viewport>;

    public viewportMetadata$?: Observable<ViewportMetadata>;

    public name?: string;

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.closePopup.emit();
    }

    async ngOnInit() {
        this.viewport$ = this.store.select(getSelectViewport(this.viewportId));
        this.viewportMetadata$ = this.store.select(
            getSelectViewportMetadata(this.viewportId)
        );

        this.apiService.currentRole$
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (role) =>
                    (activeNavId ??=
                        role === 'participant' ? 'info' : 'settings')
            );

        // Set the initial form values
        const viewport = await firstValueFrom(this.viewport$);
        this.name = viewport.name;
    }

    public async saveName() {
        const response = await this.apiService.proposeAction({
            type: '[Viewport] Rename viewport',
            viewportId: this.viewportId,
            newName: this.name!,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Ansicht erfolgreich umbenannt',
                color: 'success',
            });
            this.closePopup.emit();
        }
    }

    public async changeAutomation(currentStatus: boolean) {
        const response = await this.apiService.proposeAction({
            type: '[Viewport] Change automation',
            viewportId: this.viewportId,
            activateAutomation: currentStatus,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: currentStatus
                    ? 'Ansicht wird nun automatisiert'
                    : 'Ansicht wird nicht mehr automatisiert',
                color: 'success',
            });
            // TODO: What should happen here?
            // this.closePopup.emit();
        }
    }

    // To trick Angular
    public readonly statusNames = statusNames as { [key: string]: string };
    public readonly personnelTypeNames = personnelTypeNames as {
        [key: string]: string;
    };
}
