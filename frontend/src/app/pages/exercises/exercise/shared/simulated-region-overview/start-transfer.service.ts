import { Injectable } from '@angular/core';
import type {
    Hospital,
    TransferPoint,
    UUID,
    UUIDSet,
} from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';

export type TransferOptions = [
    UUID | undefined,
    UUIDSet | undefined,
    Hospital | TransferPoint | undefined
];

@Injectable()
export class StartTransferService {
    public readonly transferOptions = new Subject<TransferOptions>();

    public initiateNewTransferFor(transferOptions: TransferOptions) {
        this.transferOptions.next(transferOptions);
    }
}
