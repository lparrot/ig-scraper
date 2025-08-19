import {useDbStore} from "./stores/db.store";

export async function startup() {

  const dbStore = useDbStore();
  await dbStore.fetchGames();

  // Vérification des prix toutes les X minutes
  // Cela permet de mettre à jour les prix des jeux sans nécessiter une action manuelle
  setInterval(async () => {
    await dbStore.checkPrices()
  }, 1000 * 60 * 10 /* 10 minutes*/)
}