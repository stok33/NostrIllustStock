import type { Event } from './event.ts';
export declare const utf8Decoder: TextDecoder;
export declare const utf8Encoder: TextEncoder;
export declare function normalizeURL(url: string): string;
export declare function insertEventIntoDescendingList(sortedArray: Event<number>[], event: Event<number>): Event<number>[];
export declare function insertEventIntoAscendingList(sortedArray: Event<number>[], event: Event<number>): Event<number>[];
