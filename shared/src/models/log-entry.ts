import type { Tag } from './tag.js';

export class LogEntry {
    public description: string;

    public tags: Tag[];

    public timestamp: number;

    constructor(description: string, tags: Tag[], timestamp: number) {
        this.description = description;
        this.tags = tags;
        this.timestamp = timestamp;
    }
}
