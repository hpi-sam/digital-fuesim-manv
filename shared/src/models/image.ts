import { UUID, uuid } from '../utils';
import { Position, Size } from './utils';

export class Image {
    public id: UUID = uuid();

    constructor(
        public topLeft: Position,
        public size: Size,
        public blobId: UUID
    ) {}
}
