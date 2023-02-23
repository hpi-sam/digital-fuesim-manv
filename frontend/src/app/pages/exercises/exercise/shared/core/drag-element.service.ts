import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    Element,
    ImageProperties,
    MapImageTemplate,
    PatientCategory,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import {
    createVehicleParameters,
    MapImage,
    normalZoom,
    PatientTemplate,
    TransferPoint,
    Viewport,
    SimulatedRegion,
    MapPosition,
} from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type { Pixel } from 'ol/pixel';
import type VectorSource from 'ol/source/Vector';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectMaterialTemplates,
    selectPersonnelTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { FeatureManager } from '../exercise-map/utility/feature-manager';

@Injectable({
    providedIn: 'root',
})
/**
 * This service handles the adding of elements via drag and drop from the trainer map editor to the map
 */
export class DragElementService {
    private olMap?: OlMap;
    layerFeatureManagerDictionary?: Map<
        VectorLayer<VectorSource>,
        FeatureManager<any>
    >;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    public registerMap(olMap: OlMap) {
        this.olMap = olMap;
    }

    public registerLayerFeatureManagerDictionary(
        layerFeatureManagerDictionary: Map<
            VectorLayer<VectorSource>,
            FeatureManager<any>
        >
    ) {
        this.layerFeatureManagerDictionary = layerFeatureManagerDictionary;
    }

    public unregisterMap() {
        this.olMap = undefined;
    }

    public unregisterLayerFeatureManagerDictionary() {
        this.layerFeatureManagerDictionary = undefined;
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
        const pixel = this.olMap.getEventPixel(event);
        const [x, y] = this.olMap.getCoordinateFromPixel(pixel) as [
            number,
            number
        ];
        const position = { x, y };
        // create the element
        let createdElement: Element | null = null;
        switch (this.transferringTemplate.type) {
            case 'vehicle':
                {
                    const params = createVehicleParameters(
                        this.transferringTemplate.template,
                        selectStateSnapshot(
                            selectMaterialTemplates,
                            this.store
                        ),
                        selectStateSnapshot(
                            selectPersonnelTemplates,
                            this.store
                        ),
                        position
                    );
                    this.exerciseService.proposeAction(
                        {
                            ...params,
                            type: '[Vehicle] Add vehicle',
                        },
                        true
                    );
                    createdElement = params.vehicle;
                }
                break;
            case 'patient':
                {
                    const patient = PatientTemplate.generatePatient(
                        this.transferringTemplate.template.patientTemplates[
                            Math.floor(
                                Math.random() *
                                    this.transferringTemplate.template
                                        .patientTemplates.length
                            )
                        ]!,
                        this.transferringTemplate.template.name,
                        MapPosition.create(position)
                    );
                    this.exerciseService.proposeAction(
                        {
                            type: '[Patient] Add patient',
                            patient,
                        },
                        true
                    );
                    createdElement = patient;
                }
                break;
            case 'viewport':
                {
                    // This ratio has been determined by trial and error
                    const height = Viewport.image.height / 23.5;
                    const width = height * Viewport.image.aspectRatio;
                    const viewport = Viewport.create(
                        {
                            x: position.x - width / 2,
                            y: position.y + height / 2,
                        },
                        {
                            height,
                            width,
                        },
                        'Einsatzabschnitt'
                    );
                    this.exerciseService.proposeAction(
                        {
                            type: '[Viewport] Add viewport',
                            viewport,
                        },
                        true
                    );
                    createdElement = viewport;
                }
                break;

            case 'mapImage':
                {
                    const template = this.transferringTemplate.template.image;
                    const mapImage = MapImage.create(
                        position,
                        template,
                        false,
                        0
                    );
                    this.exerciseService.proposeAction({
                        type: '[MapImage] Add MapImage',
                        mapImage,
                    });
                    createdElement = mapImage;
                }
                break;
            case 'transferPoint':
                {
                    const transferPoint = TransferPoint.create(
                        position,
                        {},
                        {},
                        '???',
                        '???'
                    );
                    this.exerciseService.proposeAction(
                        {
                            type: '[TransferPoint] Add TransferPoint',
                            transferPoint,
                        },
                        true
                    );
                    createdElement = transferPoint;
                }
                break;
            case 'simulatedRegion':
                {
                    // This ratio has been determined by trial and error
                    const height = SimulatedRegion.image.height / 23.5;
                    const width = height * SimulatedRegion.image.aspectRatio;
                    const simulatedRegion = SimulatedRegion.create(
                        {
                            x: position.x - width / 2,
                            y: position.y + height / 2,
                        },
                        {
                            height,
                            width,
                        },
                        'Einsatzabschnitt ???'
                    );
                    this.exerciseService.proposeAction(
                        {
                            type: '[SimulatedRegion] Add simulated region',
                            simulatedRegion,
                        },
                        true
                    );
                    createdElement = simulatedRegion;
                }
                break;

            default:
                break;
        }

        this.executeDropSideEffects(pixel, createdElement);
    };

    private executeDropSideEffects(
        pixel: Pixel,
        createdElement: Element | null
    ) {
        if (
            createdElement === null ||
            !this.olMap ||
            !this.layerFeatureManagerDictionary
        ) {
            return;
        }
        this.olMap.forEachFeatureAtPixel(pixel, (droppedOnFeature, layer) => {
            // Skip layer when unset
            if (layer === null || !this.layerFeatureManagerDictionary) {
                return;
            }
            // We stop propagating the event as soon as the onFeatureDropped function returns true
            return this.layerFeatureManagerDictionary
                .get(layer as VectorLayer<VectorSource>)!
                .onFeatureDrop(
                    createdElement as Element,
                    droppedOnFeature as Feature
                );
        });
    }

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
          type: 'mapImage';
          template: MapImageTemplate;
      }
    | {
          type: 'patient';
          template: PatientCategory;
      }
    | {
          type: 'simulatedRegion';
          template: {
              image: ImageProperties;
          };
      }
    | {
          type: 'transferPoint';
          template: {
              image: ImageProperties;
          };
      }
    | {
          type: 'vehicle';
          template: VehicleTemplate;
      }
    | {
          type: 'viewport';
          template: {
              image: ImageProperties;
          };
      };
