import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ChangeZIndexMapImageAction,
    MapImage,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectMapImage } from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-map-image-popup',
    templateUrl: './map-image-popup.component.html',
    styleUrls: ['./map-image-popup.component.scss'],
})
export class MapImagePopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public mapImageId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public mapImage$?: Observable<MapImage>;
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    public url?: string;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    async ngOnInit() {
        this.mapImage$ = this.store.select(
            createSelectMapImage(this.mapImageId)
        );

        // Set the initial form values
        const mapImage = await firstValueFrom(this.mapImage$);
        this.url = mapImage.image.url;
    }

    public saveUrl() {
        this.exerciseService.proposeAction({
            type: '[MapImage] Reconfigure Url',
            mapImageId: this.mapImageId,
            newUrl: this.url!,
        });
    }

    public resizeImage(newHeight: number) {
        this.exerciseService.proposeAction({
            type: '[MapImage] Scale MapImage',
            mapImageId: this.mapImageId,
            newHeight,
        });
    }

    public setLocked(newLocked: boolean) {
        this.exerciseService.proposeAction({
            type: '[MapImage] Set isLocked',
            mapImageId: this.mapImageId,
            newLocked,
        });
    }

    public changeZIndex(mode: ChangeZIndexMapImageAction['mode']) {
        this.exerciseService.proposeAction({
            type: '[MapImage] Change zIndex',
            mapImageId: this.mapImageId,
            mode,
        });
    }
}
