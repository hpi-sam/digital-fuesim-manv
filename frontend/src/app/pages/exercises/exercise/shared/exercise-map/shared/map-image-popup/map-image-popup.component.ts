import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { MapImage, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectMapImage } from 'src/app/state/exercise/exercise.selectors';
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

    public url?: string;
    public height?: number;
    // TODO: Allow changing this (with effect)
    public aspectRatio?: number;

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

    async ngOnInit() {
        this.mapImage$ = this.store.select(getSelectMapImage(this.mapImageId));

        // Set the initial form values
        const mapImage = await firstValueFrom(this.mapImage$);
        this.url = mapImage.image.url;
        this.height = mapImage.image.height;
        this.aspectRatio = mapImage.image.aspectRatio;
    }

    public async saveUrl() {
        const response = await this.apiService.proposeAction({
            type: '[MapImage] Reconfigure Url',
            mapImageId: this.mapImageId,
            newUrl: this.url!,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Bild-URL erfolgreich verändert',
                color: 'success',
            });
            this.closePopup.emit();
        }
    }

    public async resizeImage(
        targetHeight: number | null,
        targetAspectRatio: number | null
    ) {
        const response = await this.apiService.proposeAction({
            type: '[MapImage] Scale MapImage',
            mapImageId: this.mapImageId,
            newHeight: targetHeight ?? this.height!,
            newAspectRatio: targetAspectRatio ?? this.aspectRatio!,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Größe des Bildes erfolgreich verändert',
                color: 'success',
            });
        }
    }
}
