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

        if (game.prices == null) {
          game.prices = []
        }

        game.prices.unshift({date: new Date(), price: game.price})
        game.prices = game.prices.slice(0, 5)

        if (game.price !== price) {
          // Mise à jour du prix du jeu
          if (game.price != null) {
            if (nostock) {
              game.priceChange = 0
            } else if (price > game.price) {
              game.priceChange = 1
            } else if (price < game.price) {
              game.priceChange = -1
            }

            if (game.priceChange === -1) {
              await window.app.notification({
                title: 'Prix baissé',
                body: `Le prix de ${game.name} a baissé à ${priceString} €`
              })
            }
          } else {
            await window.app.notification({
              title: 'Jeu disponible',
              body: `Le jeu ${game.name} est disponible à ${priceString} €`
            })
          }

          game.price = price
        }
      }

      return game
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrapStore, import.meta.hot))
}