import type { Store } from '@ngrx/store';
import type { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export interface CypressTestingValues {
    store: Store;
    socket: Socket;
    backendBaseUrl: string;
}

export const setupCypressTestingValues = (
    apply: (values: Partial<CypressTestingValues>) => void
) => {
    const anyWindow = window as any
    if (anyWindow.Cypress && !environment.production) {
        if (!anyWindow.cypressTestingValues) anyWindow.cypressTestingValues = {}
        apply(anyWindow.cypressTestingValues);
    }
};
