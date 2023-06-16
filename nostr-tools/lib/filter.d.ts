import { Event, type Kind } from './event.ts';
export type Filter<K extends number = Kind> = {
    ids?: string[];
    kinds?: K[];
    authors?: string[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
    [key: `#${string}`]: string[];
};
export declare function matchFilter(filter: Filter<number>, event: Event<number>): boolean;
export declare function matchFilters(filters: Filter<number>[], event: Event<number>): boolean;
