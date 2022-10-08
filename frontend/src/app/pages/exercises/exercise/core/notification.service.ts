import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, pairwise, Subject, switchMap, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { handleChanges } from 'src/app/shared/functions/handle-changes';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectVisibleVehicles,
    selectClients,
} from 'src/app/state/exercise/exercise.selectors';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    private readonly stopNotifications$ = new Subject<void>();

    public startNotifications() {
        // If the user is a trainer, display a message for each joined or disconnected client
        this.apiService.currentRole$
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
        this.apiService.ownClient$
            .pipe(
                filter(
                    (client) =>
                        client?.viewRestrictedToViewportId !== undefined &&
                        !client.isInWaitingRoom
                ),
                switchMap((client) =>
                    this.store.select(getSelectVisibleVehicles(client!.id))
                ),
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
