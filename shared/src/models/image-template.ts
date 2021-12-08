import { UUID, uuid } from '../utils';
import { Size } from './utils';

export class ImageTemplate {
    public id: UUID = uuid();

    constructor(
        public name: string,
        public imageBlobId: UUID,
        public initialSize: Size
    ) {}
}
