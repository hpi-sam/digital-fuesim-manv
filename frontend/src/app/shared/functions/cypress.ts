import type { Store } from '@ngrx/store';
import type { Immutable, JsonObject } from 'digital-fuesim-manv-shared';
import { environment } from 'src/environments/environment';

export interface CypressTestingValues {
    store: Store;
    proposedActions: Immutable<JsonObject>;
    performedAcctions: Immutable<JsonObject>;
    backendBaseUrl: string;
}

export const isBeingTestedByCypress = () =>
    (window as any).Cypress && !environment.production;

export const setupCypressTestingValues = (
    apply: (values: Partial<CypressTestingValues>) => void
) => {
    const anyWindow = window as any;
    if (isBeingTestedByCypress()) {
        if (!anyWindow.cypressTestingValues)
            anyWindow.cypressTestingValues = {};
        apply(anyWindow.cypressTestingValues);
    }
};
