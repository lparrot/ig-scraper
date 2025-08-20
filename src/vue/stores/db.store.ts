import {acceptHMRUpdate, defineStore} from "pinia";
import {db, Game, Log} from "../db/db";
import {useScrapStore} from "./scrap.store";

export const useDbStore = defineStore('db', {
  state: () => ({
    games: [] as Game[]
  }),
  actions: {
    async fetchLogs() {
      return db.logs.toArray();
    },
    async addLog(log: Log) {
      await db.logs.add(log)
    },
    async fetchGames() {
      this.games = await db.games.toArray();
    },
    async addGameByUrl(url: string) {
      const scrapStore = useScrapStore();
      const game = await scrapStore.scrapPage(url);
      await db.games.add(game)
      await this.fetchGames();
    },
    async deleteGame(id: number) {
      await db.games.delete(id);
      await this.fetchGames();
    },
    async clearGames() {
      await db.games.clear();
      await this.fetchGames();
      await window.app.messageBox({
        type: 'info',
        message: 'La liste des jeux a été vidée.',
        title: 'Liste vidée'
      })
    },
    async checkPrices(games?: Game[]) {
      if (!games) {
        games = this.games;
      }

      const scrapStore = useScrapStore()
      games = await Promise.all(games.map((game: Game) => scrapStore.scrapPrice(game)))

      db.games.bulkPut(games)

      await this.fetchGames();
    },
    async importGames(games: Game[]) {
      if (!games || games.length === 0) {
        return;
      }

      await this.clearGames()

      await this.checkPrices(games)
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDbStore, import.meta.hot))
}