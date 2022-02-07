import { Injectable } from '@angular/core';
import type { Immutable, VehicleTemplate } from 'digital-fuesim-manv-shared';
import { addVehicle } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';

@Injectable({
    providedIn: 'root',
})
/**
 * This service handles the adding of elements via drag and drop from the trainer map editor to the map
 */
export class DragElementService {
    private olMap?: OlMap;
    private readonly dragElementKey = 'createElement';

    constructor(private readonly apiService: ApiService) {}

    public registerMap(map: OlMap) {
        this.olMap = map;
    }

    public unregisterMap() {
        this.olMap = undefined;
    }

    public onDragStart(
        event: DragEvent,
        vehicleTemplate: Immutable<VehicleTemplate>
    ) {
        const dragImage = new Image();
        dragImage.src = vehicleTemplate.imgUrl;
        // TODO: use the zoom to scale the image correctly
        // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
        // Changing the dragImage to another element causes nondeterministic behavior
        // const zoom = this.olMap!.getView().getZoom()!;
        event.dataTransfer?.setDragImage(
            dragImage,
            dragImage.width / 2,
            dragImage.height / 2
        );
        event.dataTransfer!.dropEffect = 'copy';
        event.dataTransfer!.effectAllowed = 'copy';
        event.dataTransfer!.setData(
            this.dragElementKey,
            JSON.stringify(vehicleTemplate)
        );
    }

    public onDrop(event: DragEvent) {
        event.preventDefault();
        const vehicleTemplateString = event.dataTransfer?.getData(
            this.dragElementKey
        );
        if (!vehicleTemplateString) {
            return;
        }
        const vehicleTemplate = JSON.parse(vehicleTemplateString!);
        const [x, y] = this.olMap!.getCoordinateFromPixel([
            event.offsetX,
            event.offsetY,
        ]);
        // get the current coordinates on the map
        this.apiService.proposeAction({
            type: '[Vehicle] Add vehicle',
            ...addVehicle(vehicleTemplate, { x, y }),
        });
    }

    public onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
}
