import {LogLevel, LogType} from "../db/db";
import {useDbStore} from "../stores/db.store";

export function addLog(message: string, level: LogLevel = 'info', type: LogType = 'app') {
  const dbStore = useDbStore();
  const log = {
    date: new Date(),
    message,
    level,
    type
  }
  dbStore.addLog(log);
  console[level](`[${type}] ${message}`);
}