import type { Feature, MapBrowserEvent } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { Subject } from 'rxjs';
import type { OpenPopupOptions } from './popup-manager';

/**
 * The Api to interact with a feature
 */
export interface FeatureManager<ElementFeature extends Feature<any>> {
    readonly layer: VectorLayer<VectorSource>;

    /**
     * When this subject emits, a popup with the specified options should be toggled.
     */
    readonly togglePopup$?: Subject<OpenPopupOptions<any>>;

    /**
     * This method is called when the user clicks on a feature on this layer.
     * @param event The click event that triggered the call
     * @param feature The feature that was clicked on
     */
    onFeatureClicked: (
        event: MapBrowserEvent<any>,
        feature: ElementFeature
    ) => void;

    /**
     * @returns whether the feature can be translated
     */
    isFeatureTranslatable: (feature: ElementFeature) => boolean;

    /**
     * @param dropEvent The drop event that triggered the call
     * @param droppedFeature is dropped on {@link droppedOnFeature}
     * @param droppedOnFeature is the feature that {@link droppedFeature} is dropped on
     * @returns wether the event should not propagate further (to the features behind {@link droppedOnFeature}).
     */
    onFeatureDrop: (
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: ElementFeature
    ) => boolean;
}
