import {acceptHMRUpdate, defineStore} from "pinia";
import * as cheerio from "cheerio";
import {db, Game} from "../db/db";
import {useDbStore} from "./db.store";
import {toRaw} from "vue";
import {addLog} from "../utils/app.utils";

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
      await dbStore.checkPrices()
    },

    async scrapPage(url: string) {
      const content = await fetch(url)
      const $ = cheerio.load(await content.text())
      const $productApp = $('#product-app')

      const game: Game = {
        name: $productApp.find('meta[itemprop="name"]').attr('content'),
        url,
        image: $productApp.find('meta[itemprop="image"]').attr('content'),
        price: undefined,
        prices: []
      }

      await this.scrapPrice(game)
      return toRaw(game)
    },

    async scrapPrice(game: Game) {
      const content = await fetch(game.url)
      const $ = cheerio.load(await content.text())
      await getGameInfo(game, $)

      return toRaw(game)
    }
  }
})

async function getGameInfo(game: Game, $: cheerio.Root) {
  const nostock = $('.subinfos .nostock').length > 0 || $('.subinfos .release').length > 0

  let priceString = undefined
  let price = undefined

  if (!nostock) {
    priceString = $(`meta[itemprop="price"]`).attr('content')
  }

  if (priceString || nostock) {
    price = nostock ? undefined : Number(priceString);

    if (game.price !== price) {
      // Si ce n'est pas un ajout
      if (game.prices?.length > 0 || game.price != null) {
        if (game.prices == null) {
          game.prices = []
        }

        game.prices.unshift({date: new Date(), price: game.price})
        game.prices = game.prices.slice(0, 5)
      }

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
          addLog(`Le prix du jeu ${game.name} a baissé de ${game.price} € à ${priceString} €`)
          await window.app.notification({
            title: 'Prix baissé',
            body: `Le prix du jeu ${game.name} a baissé de ${game.price} € à ${priceString} €`
          })
        }
      } else {
        if (game.price != null) {
          addLog(`Le jeu ${game.name} est disponible à ${priceString} €`)
          await window.app.notification({
            title: 'Jeu disponible',
            body: `Le jeu ${game.name} est disponible à ${priceString} €`
          })
        }
      }

      game.price = price
    }
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrapStore, import.meta.hot))
}