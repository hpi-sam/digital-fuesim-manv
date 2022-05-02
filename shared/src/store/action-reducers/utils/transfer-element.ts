import type { Personnel, Vehicle } from '../../../models';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { ReducerError } from '../../reducer-error';
import { getElement } from './get-element';

export function transferElement(
    draftState: Mutable<ExerciseState>,
    element: Mutable<Personnel | Vehicle>,
    startTransferPointId: UUID,
    targetTransferPointId: UUID
) {
    if (!element.position) {
        throw new ReducerError(
            `Element with id ${element.id} is already in transfer`
        );
    }
    const startTransferPoint = getElement(
        draftState,
        'transferPoints',
        startTransferPointId
    );
    const connection =
        startTransferPoint.reachableTransferPoints[targetTransferPointId];
    if (!connection) {
        throw new ReducerError(
            `TransferPoint with id ${targetTransferPointId} is not reachable from ${startTransferPointId}`
        );
    }
    // The element is now in transfer
    delete element.position;
    element.transfer = {
        startTransferPointId,
        targetTransferPointId,
        endTimeStamp: draftState.currentTime + connection.duration,
    };
}
