import { Injectable } from '@angular/core';
import type {
    Immutable,
    PatientTemplate,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { Patient, addVehicle } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import { ImageStyleHelper } from '../exercise-map/utility/get-image-style-function';
import { VehicleFeatureManager } from '../exercise-map/feature-managers/vehicle-feature-manager';
import { PatientFeatureManager } from '../exercise-map/feature-managers/patient-feature-manager';

@Injectable({
    providedIn: 'root',
})
/**
 * This service handles the adding of elements via drag and drop from the trainer map editor to the map
 */
export class DragElementService {
    private olMap?: OlMap;
    private readonly dragElementKey = 'createElement';

    private readonly normalizedImageHeights = {
        vehicle: VehicleFeatureManager.normalizedImageHeight,
        patient: PatientFeatureManager.normalizedImageHeight,
    };

    constructor(private readonly apiService: ApiService) {}

    public registerMap(map: OlMap) {
        this.olMap = map;
    }

    public unregisterMap() {
        this.olMap = undefined;
    }

    /**
     * This should be called in the dragStart handler of the template in the sidebar
     */
    public onDragStart(event: DragEvent, transferTemplate: TransferTemplate) {
        // Create the drag image
        const dragImage = new Image();
        dragImage.src = transferTemplate.template.imageUrl;
        const zoom = this.olMap!.getView().getZoom()!;
        const height =
            this.normalizedImageHeights[transferTemplate.type] *
            // One higher zoom level means to double the height of the image
            Math.pow(2, zoom - ImageStyleHelper.normalZoom) *
            // For some reason we need this additional factor to make it work - determined via best effort guess
            2.3;
        const width = height * (dragImage.width / dragImage.height);
        // We need a container, because styles on an image element are ignored per API specification (image is interpreted as a bitmap)
        const container = this.createDragImageContainer(dragImage, height);
        event.dataTransfer?.setDragImage(container, width / 2, height / 2);
        // This seems to be optional...
        event.dataTransfer!.dropEffect = 'copy';
        event.dataTransfer!.effectAllowed = 'copy';

        event.dataTransfer!.setData(
            this.dragElementKey,
            JSON.stringify(transferTemplate)
        );
    }

    /**
     * The container for the drag image has to be somewhere in the DOM,
     * otherwise the drag image is not rendered
     * This is the container for this.
     */
    private createDragImageContainer(
        imageElement: HTMLImageElement,
        height: number
    ) {
        const container = document.createElement('div');
        container.style.height = `${height}px`;
        // The element must be rendered, but should not be visible (this is a hack -> it could be different from browser to browser)
        container.style.position = 'absolute';
        container.style.top = '-1000px';
        document.body.prepend(container);
        // We assume that only one drag operation can be made at a time
        document.addEventListener(
            'dragend',
            (event) => {
                container?.remove();
            },
            {
                once: true,
            }
        );
        container.append(imageElement);
        // The image should have the size of the container
        imageElement.style.height = '100%';
        return container;
    }

    /**
     * This should be called in the drop handler of the map
     */
    public onDrop(event: DragEvent) {
        event.preventDefault();
        const transferTemplateString = event.dataTransfer?.getData(
            this.dragElementKey
        );
        if (!transferTemplateString) {
            // TODO: display message that this is not a valid element to drop on the map
            return;
        }
        event.preventDefault();
        const transferTemplate: TransferTemplate = JSON.parse(
            transferTemplateString
        );
        const [x, y] = this.olMap!.getCoordinateFromPixel([
            event.offsetX,
            event.offsetY,
        ]);
        const position = { x, y };
        switch (transferTemplate.type) {
            case 'vehicle':
                this.apiService.proposeAction(
                    {
                        type: '[Vehicle] Add vehicle',
                        ...addVehicle(transferTemplate.template, position),
                    },
                    true
                );
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
                    this.apiService.proposeAction(
                        {
                            type: '[Patient] Add patient',
                            patient,
                        },
                        true
                    );
                }
                break;
            default:
                break;
        }
    }

    /**
     * This should be called in the dragover handler of the map
     */
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
