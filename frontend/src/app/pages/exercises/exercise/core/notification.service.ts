import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, pairwise, Subject, switchMap, takeUntil } from 'rxjs';
import { MessageService } from 'src/app/core/messages/message.service';
import { handleChanges } from 'src/app/shared/functions/handle-changes';
import type { AppState } from 'src/app/state/app.state';
import { selectClients } from 'src/app/state/application/selectors/exercise.selectors';
import {
    selectVisibleVehicles,
    selectCurrentRole,
    selectOwnClient,
} from 'src/app/state/application/selectors/shared.selectors';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    private readonly stopNotifications$ = new Subject<void>();

    public startNotifications() {
        // If the user is a trainer, display a message for each joined or disconnected client
        this.store
            .select(selectCurrentRole)
            .pipe(
                filter((role) => role === 'trainer'),
                switchMap(() => this.store.select(selectClients)),
                pairwise(),
                takeUntil(this.stopNotifications$)
            )
            .subscribe(([oldClients, newClients]) => {
                handleChanges(oldClients, newClients, {
                    createHandler: (newClient) => {
                        this.messageService.postMessage({
                            title: `${newClient.name} ist als ${
                                newClient.role === 'trainer'
                                    ? 'Trainer'
                                    : 'Teilnehmer'
                            } beigetreten.`,
                            color: 'info',
                        });
                    },
                    deleteHandler: (oldClient) => {
                        this.messageService.postMessage({
                            title: `${oldClient.name} hat die Übung verlassen.`,
                            color: 'info',
                        });
                    },
                });
            });
        // If the user is restricted to a viewport, display a message for each vehicle that arrived at this viewport
        this.store
            .select(selectOwnClient)
            .pipe(
                filter(
                    (client) =>
                        client?.viewRestrictedToViewportId !== undefined &&
                        !client.isInWaitingRoom
                ),
                switchMap((client) => this.store.select(selectVisibleVehicles)),
                pairwise(),
                takeUntil(this.stopNotifications$)
            )
            .subscribe(([oldVehicles, newVehicles]) => {
                handleChanges(oldVehicles, newVehicles, {
                    createHandler: (newVehicle) => {
                        this.messageService.postMessage({
                            title: `${newVehicle.name} ist eingetroffen.`,
                            color: 'info',
                        });
                    },
                });
            });
    }

    public stopNotifications() {
        this.stopNotifications$.next();
    }
}
