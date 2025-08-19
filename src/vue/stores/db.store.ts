import {acceptHMRUpdate, defineStore} from "pinia";
import {db, Game} from "../db/db";
import {useScrapStore} from "./scrap.store";
import {toRaw} from "vue";

export const useDbStore = defineStore('db', {
  state: () => ({
    games: [] as Game[],
  }),
  actions: {
    async fetchGames() {
      this.games = await db.games.toArray();
    },
    async addGame(game: Game) {
      await db.games.add(game);
      await this.fetchGames();
    },
    async deleteGame(id: number) {
      await db.games.delete(id);
      await this.fetchGames();
    },
    async clearGames() {
      await db.games.clear();
      await this.fetchGames();
    },
    async checkPrices(games?: Game[]) {
      if (!games) {
        games = this.games;
      }

      games = toRaw(games)

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

      games = await this.checkPrices(games)

      await this.fetchGames()
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDbStore, import.meta.hot))
}