import {acceptHMRUpdate, defineStore} from "pinia";
import * as cheerio from "cheerio";
import {db, Game} from "../db/db";
import {useDbStore} from "./db.store";

export const useScrapStore = defineStore('scrap', {
    actions: {
        async scrap(content: string) {
            const dbStore = useDbStore()

            const $ = cheerio.load(content)
            const results = [] as Game[];

            await db.games.clear()

            $('article.item').each((index, element) => {
                const $article = $(element);
                const $link = $article.find('a.cover');
                const $title = $article.find('div.information').find('span.title');
                const $image = $article.find('img.picture');

                const url = $link.attr('href');
                const name = $title.attr('title');
                const image = $image.attr('data-src')

                // Ajouter les données extraites à notre tableau de résultats
                results.push({
                    name,
                    url,
                    image,
                    price: undefined
                });
            });

            console.log(results)

            await db.games.bulkAdd(results)
            await dbStore.fetchGames()
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useScrapStore, import.meta.hot))
}