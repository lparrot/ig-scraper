import {acceptHMRUpdate, defineStore} from "pinia";
import {db, Game} from "../db/db";

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
            await this.fetchGames(); // Refresh the list after adding
        },
        async deleteGame(id: number) {
            await db.games.delete(id);
            await this.fetchGames(); // Refresh the list after deletion
        },
        async clearGames() {
            await db.games.clear();
            await this.fetchGames(); // Refresh the list after clearing
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useDbStore, import.meta.hot))
}