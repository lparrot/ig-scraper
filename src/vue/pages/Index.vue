<script lang="ts" setup>
import {useDbStore} from "../stores/db.store";
import {storeToRefs} from "pinia";
import {reactive, ref, toRaw} from "vue";
import {useScrapStore} from "../stores/scrap.store";
import type {FormSubmitEvent, TableColumn, TabsItem} from "@nuxt/ui";
import {db, Game, Log} from "../db/db";
import {z} from "zod";
import {addLog} from "../utils/app.utils";
import {liveQuery} from "dexie";

type SchemaAddNewGame = z.infer<typeof schemaNewGame>

const dbStore = useDbStore()
const scrapStore = useScrapStore()

const {games} = storeToRefs(dbStore)
const logs = ref([])

liveQuery(() => db.logs.reverse().toArray()).subscribe(value => {
  logs.value = value
})

const columns_games: TableColumn<Game>[] = [
  {accessorKey: 'image', header: 'Image'},
  {accessorKey: 'name', header: 'Nom'},
  {accessorKey: 'price', header: 'Prix actuel'},
  {accessorKey: 'lastPrice', header: 'Dernier prix'},
  {accessorKey: 'other', header: ''},
  {accessorKey: 'actions', header: ''},
]

const columns_logs: TableColumn<Log>[] = [
  {accessorKey: 'date', header: 'Date'},
  {accessorKey: "level", header: 'Niveau'},
  {accessorKey: 'message', header: 'Message'},
  {accessorKey: 'type', header: 'Type'},
]

const tabs: TabsItem[] = [
  {
    label: 'Jeux',
    value: 'games',
    icon: 'i-ic-baseline-gamepad',
    slot: 'games' as const,
  },
  {
    label: 'Administration',
    value: 'admin',
    icon: 'i-ic-baseline-settings',
    slot: 'admin' as const,
  },
  {
    label: 'Logs',
    value: 'logs',
    icon: 'i-ic-twotone-insert-drive-file',
    slot: 'logs' as const,
  },
]

const modals = reactive({
  addNewGame: false
})

const schemaNewGame = z.object({
  url: z.url(),
})

const formNewGame = reactive<Partial<SchemaAddNewGame>>({
  url: ''
})

const state = reactive({
  activeTab: 'games' as string,
  file: null as File | null,
  whishlistContent: '',
})

async function addNewGame(event: FormSubmitEvent<SchemaAddNewGame>) {
  const game = await dbStore.addGameByUrl(event.data.url)
  addLog(`Le jeu ${game.name} a été ajouté avec succès depuis l'URL: ${event.data.url}`)
  modals.addNewGame = false
}

async function importFile(file: File | null) {
  if (!file) return
  state.whishlistContent = await file.text()
  state.file = null
}

async function scrapPage() {
  state.activeTab = 'games'
  await scrapStore.scrapWhishlist(state.whishlistContent)
  state.whishlistContent = ''
  addLog('La liste de jeux a été chargée depuis le contenu de la wishlist.')
  await window.app.messageBox({
    title: 'Importation réussie',
    message: `La liste de jeux a été importée avec succès.`,
    type: 'info',
  })
}

async function openInBrowser(url: string) {
  await window.app.openInBrowser(url)
}

async function exportGames() {
  await window.electron.invoke('data:export', toRaw(games.value))
}

function deleteGame(game: Game) {
  dbStore.deleteGame(game.id)
  addLog(`Le jeu ${game.name} a été supprimé.`)
}

async function checkPrices() {
  await dbStore.checkPrices()
  addLog('Les prix des jeux ont été vérifiés et mis à jour.')
  await window.app.messageBox({
    title: 'Vérification des prix',
    message: `Les prix des jeux ont été mis à jour.`,
    type: 'info',
  })
}

async function importGames() {
  const importedGames = await window.electron.invoke('data:import')
  if (importedGames) {
    await dbStore.importGames(importedGames)
    addLog(`${importedGames.length} jeux ont été importés avec succès via un fichier JSON.`)
    await window.app.messageBox({
      title: 'Importation réussie',
      message: `${importedGames.length} jeux ont été importés avec succès.`,
    })
  } else {
    await window.app.messageBox({
      title: 'Importation échouée',
      message: `Aucun jeu n'a été importé. Veuillez vérifier le fichier et réessayer.`,
      type: "error",
    })
  }
  state.activeTab = 'games'
}
</script>

<template>
  <UTabs v-model="state.activeTab" :items="tabs" class="w-full">
    <template #games>
      <div class="flex items-center gap-2">
        <UButton class="cursor-pointer" icon="i-ic-baseline-plus" label="Ajouter un jeu" @click="modals.addNewGame = true"/>
        <UButton class="cursor-pointer" icon="i-ic-baseline-refresh" label="Vérifier les prix" @click="checkPrices()"/>
      </div>
      <UTable :columns="columns_games" :data="games" :ui="{td: 'p-1'}" class="w-full" empty="La liste des jeux est vide.">
        <template #image-cell="{row}">
          <div class="cursor-pointer" @click="openInBrowser(row.original.url)">
            <img :alt="`${row.original.name} image`" :src="row.original.image" width="60">
          </div>
        </template>

        <template #name-cell="{row}">
          <span>{{ row.original.name }}</span>
        </template>

        <template #price-cell="{row}">
          <span v-if="row.original.price != null">{{ row.original.price }} €</span>
          <span v-else>Pas de stock</span>
        </template>

        <template #lastPrice-cell="{row}">
          <span v-if="row.original.prices?.length > 0">{{ row.original.prices[0].price == null ? 'Pas de stock' : `${row.original.prices[0].price} €` }}</span>
          <span v-else>-</span>
        </template>

        <template #other-cell="{row}">
          <div class="flex items-center gap-2">
            <UIcon v-if="row.original.priceChange === 1" class="size-5 text-error" name="i-ic-baseline-arrow-circle-up"/>
            <UIcon v-else-if="row.original.priceChange === -1" class="size-5 text-success" name="i-ic-baseline-arrow-circle-down"/>
          </div>
        </template>

        <template #actions-cell="{row}">
          <div class="flex items-center gap-2">
            <UButton color="error" icon="i-ic-baseline-delete" size="xs" @click="deleteGame(row.original)"/>
          </div>
        </template>
      </UTable>
    </template>

    <template #admin>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UButton @click="dbStore.clearGames()">Supprimer tous les jeux</UButton>
          <UButton @click="exportGames()">Exporter les jeux</UButton>
          <UButton @click="importGames()">Importer les jeux</UButton>
        </div>

        <div class="flex items-center gap-4">
          Charger un fichier:
          <UFileUpload v-model="state.file" variant="button" @change="importFile(state.file)"/>
        </div>

        <div>
          <UTextarea v-model="state.whishlistContent" :rows="20" class="w-full"></UTextarea>
        </div>

        <div>
          <UButton @click="scrapPage">Charger la liste des jeux</UButton>
        </div>
      </div>
    </template>

    <template #logs>
      <UTable :columns="columns_logs" :data="logs" :ui="{td: ['p-1']}" class="w-full" empty="Aucun log disponible.">
        <template #date-cell="{row}">
          <span>{{ new Date(row.original.date).toLocaleString() }}</span>
        </template>

        <template #level-cell="{row}">
          <UBadge :color="row.original.level" variant="soft">{{ row.original.level }}</UBadge>
        </template>
      </UTable>
    </template>
  </UTabs>

  <UModal v-model:open="modals.addNewGame" description="Entrez l'URL du jeu à ajouter" icon="i-ic-baseline-add" title="Ajouter un jeu" @update:open="formNewGame.url = ''">

    <template #body>
      <UForm id="form_new_game" :schema="schemaNewGame" :state="formNewGame" class="flex flex-col space-y-4" @submit="addNewGame">
        <UFormField label="Url du jeu à ajouter" name="url">
          <UInput v-model="formNewGame.url" class="w-full"/>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton form="form_new_game" label="Ajouter le jeu" type="submit"/>
    </template>
  </UModal>
</template>

<style scoped>

</style>