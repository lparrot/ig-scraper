import {acceptHMRUpdate, defineStore} from "pinia";
import * as cheerio from "cheerio";
import {db, Game} from "../db/db";
import {useDbStore} from "./db.store";

export const useScrapStore = defineStore('scrap', {
    actions: {
        async scrapWhishlist(content: string) {
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
                    price: undefined,
                    prices: []
                });
            });

            await db.games.bulkAdd(results)
            await dbStore.fetchGames();
            await dbStore.checkPrices()
        },

        async scrapPrice(game: Game) {
            const content = await fetch(game.url)
            const $ = cheerio.load(await content.text())
            const nostock = $('.subinfos .nostock').length > 0 || $('.subinfos .release').length > 0

            let priceString = undefined
            let price = undefined

            if (!nostock) {
                priceString = $(`meta[itemprop="price"]`).attr('content')
            }

            if (priceString || nostock) {
                price = nostock ? undefined : Number(priceString);

                if (game.price !== price) {
                    if (game.price != null) {
                        if (game.prices == null) {
                            game.prices = []
                        }

                        game.prices.unshift({date: new Date(), price: game.price})
                        game.prices = game.prices.slice(0, 5)
                    }

                    game.price = price
                }

                game.priceChange = nostock ? 0 : (game.price < price ? 1 : (game.price > price ? -1 : 0));
            }

            return game
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useScrapStore, import.meta.hot))
}