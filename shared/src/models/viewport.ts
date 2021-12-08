import { UUID, uuid } from '../utils';
import { Position, Size } from './utils';

export class Viewport {
    public id: UUID = uuid();

    constructor(
        public topLeft: Position,
        public size: Size,
        public name: string
    ) {}
}
