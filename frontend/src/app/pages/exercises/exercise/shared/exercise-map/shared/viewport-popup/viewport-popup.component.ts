import type { OnDestroy, OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    PatientStatus,
    PersonnelType,
    UUID,
    Viewport,
    TransferPoint,
    Hospital,
    AutomatedViewportConfig,
    TransferMode,
} from 'digital-fuesim-manv-shared';
import {
    cloneDeepMutable,
    statusNames,
    personnelTypeNames,
    transferModeNames,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectAutomatedViewportConfiguration,
    getSelectElementsInViewport,
    getSelectReachableTransferPoints,
    getSelectViewport,
    getSelectViewportMetadata,
    selectHospitals,
} from 'src/app/state/exercise/exercise.selectors';
import type { WithPosition } from '../../../utility/types/with-position';
import type { PopupComponent } from '../../utility/popup-manager';

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
export class ViewportPopupComponent
    implements PopupComponent, OnInit, OnDestroy
{
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

    public transferPointsInViewport$?: Observable<{
        [id: UUID]: WithPosition<TransferPoint>;
    }>;

    public reachableTransferPoints$?: Observable<TransferPoint[]>;

    public hospitals$?: Observable<{ [id: UUID]: Hospital }>;

    public viewportConfig$?: Observable<AutomatedViewportConfig>;

    public viewportConfig?: AutomatedViewportConfig;

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
        this.viewport$
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (thisViewport) =>
                    (this.transferPointsInViewport$ = this.store.select(
                        getSelectElementsInViewport(
                            'transferPoints',
                            thisViewport
                        )
                    ))
            );
        this.viewport$
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (thisViewport) =>
                    (this.reachableTransferPoints$ = thisViewport
                        .automatedPatientFieldConfig.sourceTransferPointId
                        ? this.store.select(
                              getSelectReachableTransferPoints(
                                  thisViewport.automatedPatientFieldConfig
                                      .sourceTransferPointId
                              )
                          )
                        : undefined)
            );
        this.hospitals$ = this.store.select(selectHospitals);
        this.viewportConfig$ = this.store.select(
            getSelectAutomatedViewportConfiguration(this.viewportId)
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
        this.viewportConfig$
            .pipe(takeUntil(this.destroy$))
            .subscribe((config) => (this.viewportConfig = config));
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

    public async changeAutomationActivation(currentStatus: boolean) {
        const response = await this.apiService.proposeAction({
            type: '[Viewport] Change automation activation state',
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

    public async changeAutomationConfig(
        type: 'hospital' | 'source' | 'targetTransfer' | 'transferMode',
        id?: UUID
    ) {
        const currentConfig = cloneDeepMutable(this.viewportConfig);
        if (currentConfig === undefined) return;
        switch (type) {
            case 'hospital':
                currentConfig.targetHospitalId = id;
                if (
                    id === undefined &&
                    currentConfig.transferMode === 'hospital'
                )
                    currentConfig.transferMode = 'none';
                break;
            case 'source':
                if (currentConfig.sourceTransferPointId !== id) {
                    currentConfig.targetTransferPointId = undefined;
                    if (currentConfig.transferMode === 'transfer')
                        currentConfig.transferMode = 'none';
                }
                currentConfig.sourceTransferPointId = id;
                break;
            case 'targetTransfer':
                currentConfig.targetTransferPointId = id;
                if (
                    id === undefined &&
                    currentConfig.transferMode === 'transfer'
                )
                    currentConfig.transferMode = 'none';
                break;
            case 'transferMode':
                currentConfig.transferMode = id as TransferMode;
                break;
        }
        const response = await this.apiService.proposeAction({
            type: '[Viewport] Update automation',
            viewportId: this.viewportId,
            config: currentConfig,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Automatisierungseinstellungen wurden aktualisiert',
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
    public readonly transferModeNames = transferModeNames as {
        [key: string]: string;
    };
}
