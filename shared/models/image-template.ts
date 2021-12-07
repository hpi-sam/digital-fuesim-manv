import { UUID } from '../utils';
import { Size } from './utils';

export class ImageTemplate {
    public id: UUID;

    public name: string;

    public imageBlobId: UUID;

    public initialSize: Size;
}
