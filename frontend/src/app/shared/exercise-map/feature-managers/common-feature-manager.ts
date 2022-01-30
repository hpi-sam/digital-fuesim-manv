import type { UUID, Position } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type OlMap from 'ol/Map';
import { MovementAnimator } from '../utility/movement-animator';
import { TranslateHelper } from '../utility/translate-helper';
import { ImageStyleHelper } from '../utility/get-image-style-function';
import { FeatureManager } from './feature-manager';

type ElementFeature = Feature<Point>;
type SupportedChangeProperties = ReadonlySet<'position'>;

/**
 * Bundles common functionality for multiple feature managers:
 * * moveable element
 * * image as style
 * TODO: it is expected that in the future less and less functionality will be the same for the different feature managers as they get more customized.
 * - Do not try to make this a class with a monster API. Instead let the classes not extend from this class.
 * Find a good solution/compromise between composition, inheritance (there is no multi-inheritance in JS, but you can overwrite methods and call the previous one via `super.foo()`), decorators and mixins.
 */
export abstract class CommonFeatureManager<
    Element extends Readonly<{ id: UUID; position: Position }>
> extends FeatureManager<Element, ElementFeature, SupportedChangeProperties> {
    private readonly movementAnimator = new MovementAnimator(
        this.olMap,
        this.layer
    );
    private readonly translateHelper = new TranslateHelper();
    private readonly imageStyleHelper = new ImageStyleHelper(
        this.imageOptions.imageUrl,
        this.imageOptions.imageHeight,
        true
    );

    constructor(
        private readonly olMap: OlMap,
        private readonly layer: VectorLayer<VectorSource<Point>>,
        private readonly imageOptions: {
            /**
             * The height of the image in pixels that should be used at {@link ImageStyleHelper.normalZoom} zoom
             */
            imageHeight: number;
            imageUrl: string;
        },
        private readonly proposeMovementAction: (
            newPosition: Position,
            element: Element
        ) => void
    ) {
        super();
        this.layer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(
                feature as ElementFeature,
                resolution
            )
        );
    }

    createFeature(element: Element): void {
        const elementFeature = new Feature(
            new Point([element.position.x, element.position.y])
        );
        elementFeature.setId(element.id);
        this.layer.getSource().addFeature(elementFeature);
        this.translateHelper.onTranslateEnd(elementFeature, (newPosition) => {
            this.proposeMovementAction(newPosition, element);
        });
    }

    deleteFeature(element: Element, elementFeature: ElementFeature): void {
        this.layer.getSource().removeFeature(elementFeature);
        this.movementAnimator.stopMovementAnimation(elementFeature);
    }

    readonly supportedChangeProperties = new Set(['position'] as const);
    changeFeature(
        oldElement: Element,
        newElement: Element,
        changedProperties: SupportedChangeProperties,
        patientFeature: ElementFeature
    ): void {
        if (changedProperties.has('position')) {
            this.movementAnimator.animateFeatureMovement(patientFeature, [
                newElement.position.x,
                newElement.position.y,
            ]);
        }
    }

    getElementFeature(element: Element) {
        return this.layer.getSource().getFeatureById(element.id) as
            | ElementFeature
            | undefined;
    }
}
