import { UUID } from "../utils";
import { Position, Size } from "./utils";

export class Viewport {
    public id: UUID;

    public topLeft: Position;

    public size: Size;

    public name: string;
}
