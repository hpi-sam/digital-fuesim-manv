import { Injectable } from '@angular/core';
import type {
    Immutable,
    PatientTemplate,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { Patient, addVehicle } from 'digital-fuesim-manv-shared';
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

    public onDragStart(event: DragEvent, transferTemplate: TransferTemplate) {
        const dragImage = new Image();
        dragImage.src = transferTemplate.template.imageUrl;
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
            JSON.stringify(transferTemplate)
        );
    }

    public onDrop(event: DragEvent) {
        event.preventDefault();
        const transferTemplateString = event.dataTransfer?.getData(
            this.dragElementKey
        );
        if (!transferTemplateString) {
            return;
        }
        const transferTemplate: TransferTemplate = JSON.parse(
            transferTemplateString!
        );
        const [x, y] = this.olMap!.getCoordinateFromPixel([
            event.offsetX,
            event.offsetY,
        ]);
        const position = { x, y };
        switch (transferTemplate.type) {
            case 'vehicle':
                // get the current coordinates on the map
                this.apiService.proposeAction({
                    type: '[Vehicle] Add vehicle',
                    ...addVehicle(transferTemplate.template, position),
                });
                break;
            case 'patient':
                {
                    const patient = new Patient(
                        transferTemplate.template.personalInformation,
                        transferTemplate.template.visibleStatus,
                        transferTemplate.template.realStatus,
                        ''
                    );
                    patient.position = position;
                    // get the current coordinates on the map
                    this.apiService.proposeAction({
                        type: '[Patient] Add patient',
                        patient,
                    });
                }
                break;
            default:
                break;
        }
    }

    public onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
}

type TransferTemplate =
    | {
          type: 'patient';
          template: Immutable<PatientTemplate>;
      }
    | {
          type: 'vehicle';
          template: Immutable<VehicleTemplate>;
      };
