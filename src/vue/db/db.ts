import Dexie, {EntityTable} from "dexie";

interface Game {
    id?: number;
    name: string;
    url: string;
    image: string;
    price: number;
    prices?: Array<{date: Date, price: number}>;
    priceChange?: -1 | 0 | 1; // -1 pour baisse, 0 pour stable, 1 pour hausse
}

const db = new Dexie('IGWebScrapingDB') as Dexie & {
    games: EntityTable<Game, 'id'>
};

db.version(1).stores({
    games: '++id, name, url, prices'
})

export type {Game}
export {db}