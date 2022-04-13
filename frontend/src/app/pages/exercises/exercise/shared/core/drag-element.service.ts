import { Injectable } from '@angular/core';
import type {
    PatientTemplate,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { Patient, normalZoom, addVehicle } from 'digital-fuesim-manv-shared';
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

    constructor(private readonly apiService: ApiService) {}

    public registerMap(map: OlMap) {
        this.olMap = map;
    }

    public unregisterMap() {
        this.olMap = undefined;
    }

    private dragElement?: HTMLImageElement;
    private imageDimensions?: { width: number; height: number };
    private transferringTemplate?: TransferTemplate;

    /**
     * Should be called on the mousedown event of the element to be dragged
     * @param event the mouse event
     * @param transferTemplate the template to be added
     */
    public onMouseDown(event: MouseEvent, transferTemplate: TransferTemplate) {
        this.transferringTemplate = transferTemplate;
        // Create the drag image
        const imageProperties = transferTemplate.template.image;
        const zoom = this.olMap!.getView().getZoom()!;
        const zoomFactor = // One higher zoom level means to double the height of the image
            Math.pow(2, zoom - normalZoom) *
            // For some reason we need this additional factor to make it work - determined via best effort guess
            // Changing the scale of the image in OpenLayers does have an influence on the number here. So maybe something to do with a cache.
            2.3;
        this.dragElement = document.createElement('img');
        this.dragElement.src = imageProperties.url;
        this.dragElement.style.position = 'absolute';
        this.imageDimensions = {
            width:
                zoomFactor *
                imageProperties.height *
                imageProperties.aspectRatio,
            height: zoomFactor * imageProperties.height,
        };
        this.dragElement.style.width = `${this.imageDimensions.width}px`;
        this.dragElement.style.height = `${this.imageDimensions.height}px`;
        this.updateDragElementPosition(event);
        document.body.append(this.dragElement);
        // The dragging logic
        event.preventDefault();
        document.body.style.cursor = 'move';
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    private readonly onMouseMove = (event: MouseEvent) => {
        event.preventDefault();
        this.updateDragElementPosition(event);
    };

    private updateDragElementPosition(event: MouseEvent) {
        if (!this.dragElement || !this.imageDimensions) {
            console.log('dragElement or imageDimensions are undefined', this);
            return;
        }
        // max and min to not move out of the window
        this.dragElement.style.left = `${Math.max(
            Math.min(
                event.clientX - this.imageDimensions.width / 2,
                window.innerWidth - this.imageDimensions.width
            ),
            0
        )}px`;
        this.dragElement.style.top = `${Math.max(
            Math.min(
                event.clientY - this.imageDimensions.height / 2,
                window.innerHeight - this.imageDimensions.height
            ),
            0
        )}px`;
    }

    private readonly onMouseUp = (event: MouseEvent) => {
        // Remove the dragging stuff
        event.preventDefault();
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        this.dragElement?.remove();

        if (!this.transferringTemplate || !this.olMap) {
            console.error('No template or map to add the element to', this);
            return;
        }
        // We don't want to add the element if the mouse is outside the map
        if (
            !this.coordinatesAreInElement(this.olMap.getTargetElement(), event)
        ) {
            return;
        }
        // Get the position of the mouse on the map
        const [x, y] = this.olMap.getCoordinateFromPixel(
            this.olMap.getEventPixel(event)
        );
        const position = { x, y };
        // create the element
        switch (this.transferringTemplate.type) {
            case 'vehicle':
                this.apiService.proposeAction(
                    {
                        type: '[Vehicle] Add vehicle',
                        ...addVehicle(
                            this.transferringTemplate.template,
                            position
                        ),
                    },
                    true
                );
                break;
            case 'patient':
                {
                    const patient = Patient.fromTemplate(
                        this.transferringTemplate.template
                    );
                    this.apiService.proposeAction(
                        {
                            type: '[Patient] Add patient',
                            patient: {
                                ...patient,
                                position,
                            },
                        },
                        true
                    );
                }
                break;
            default:
                break;
        }
    };

    /**
     *
     * @returns wether {@link coordinates} are in {@link element}
     */
    private coordinatesAreInElement(
        element: HTMLElement,
        coordinates: { x: number; y: number }
    ) {
        const rect = element.getBoundingClientRect();
        return (
            coordinates.x >= rect.left &&
            coordinates.x <= rect.right &&
            coordinates.y >= rect.top &&
            coordinates.y <= rect.bottom
        );
    }
}

type TransferTemplate =
    | {
          type: 'patient';
          template: PatientTemplate;
      }
    | {
          type: 'vehicle';
          template: VehicleTemplate;
      };
