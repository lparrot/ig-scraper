import {useDbStore} from "./stores/db.store";
import {z} from "zod";
import {liveQuery} from "dexie";
import {db, Game, Log} from "./db/db";

export async function startup() {

  z.config(z.locales.fr())

  const dbStore = useDbStore();

  // Chargement des jeux dans le store
  liveQuery(() => db.games.toArray()).subscribe((value: Game[]) => {
    dbStore.games = value
  })

  // Chargement des logs dans le store
  liveQuery(() => db.logs.reverse().toArray()).subscribe((value: Log[]) => {
    dbStore.logs = value
  })

  // Vérification des prix toutes les X minutes
  // Cela permet de mettre à jour les prix des jeux sans nécessiter une action manuelle
  setInterval(async () => {
    await dbStore.checkPrices()
  }, 1000 * 60 * 10 /* 10 minutes*/)
}