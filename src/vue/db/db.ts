import Dexie, {EntityTable} from "dexie";

interface Game {
    id?: number;
    name: string;
    url: string;
    image: string;
    price: number;
}

const db = new Dexie('IGWebScrapingDB') as Dexie & {
    games: EntityTable<Game, 'id'>
};

db.version(1).stores({
    games: '++id, name, url, price'
})

export type {Game}
export {db}