import Dexie, {EntityTable} from "dexie";

export type LogLevel = 'info' | 'warn' | 'error';
export type LogType = 'app' | 'db';

export interface Game {
    id?: number;
    name: string;
    url: string;
    image: string;
    price: number;
    prices?: Array<{date: Date, price: number}>;
    priceChange?: -1 | 0 | 1; // -1 pour baisse, 0 pour stable, 1 pour hausse
}

export interface Log {
  id?: number;
  date: Date;
  message: string;
  level: LogLevel;
  type: LogType
}

const db = new Dexie('IGWebScrapingDB') as Dexie & {
  games: EntityTable<Game, 'id'>,
  logs: EntityTable<Log, 'id'>,
};

db.version(1).stores({
  games: '++id, name, url, prices',
  logs: '++id, message, level, type',
})

export {db}