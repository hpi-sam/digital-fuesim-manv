import { UUID } from '../utils';
import { Position, Size } from './utils';

export class Image {
    public id: UUID;

    public topLeft: Position;

    public size: Size;

    public blobId: UUID;
}
