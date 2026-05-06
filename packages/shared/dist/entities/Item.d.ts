import type { Item } from '../types/index.js';
export declare const ITEM_DATABASE: Record<string, Item>;
export declare function getItem(id: string): Item | undefined;
