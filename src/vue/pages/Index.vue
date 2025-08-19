<script lang="ts" setup>
import {useDbStore} from "../stores/db.store";
import {storeToRefs} from "pinia";
import {reactive, toRaw} from "vue";
import {useScrapStore} from "../stores/scrap.store";
import type {TableColumn, TabsItem} from "@nuxt/ui";
import {Game} from "../db/db";

const dbStore = useDbStore()
const scrapStore = useScrapStore()

const {games} = storeToRefs(dbStore)

const columns: TableColumn<Game>[] = [
  {accessorKey: 'image', header: 'Image'},
  {accessorKey: 'name', header: 'Nom'},
  {accessorKey: 'price', header: 'Prix actuel'},
  {accessorKey: 'lastPrice', header: 'Dernier prix'},
  {accessorKey: 'other', header: ''},
  {accessorKey: 'actions', header: ''},
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
]

const state = reactive({
  activeTab: 'games' as string,
  file: null as File | null,
  whishlistContent: '',
})

async function importFile(file: File | null) {
  if (!file) return
  state.whishlistContent = await file.text()
  state.file = null
}

async function scrapPage() {
  state.activeTab = 'games'
  await scrapStore.scrapWhishlist(state.whishlistContent)
  state.whishlistContent = ''
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

async function checkPrices() {
  await dbStore.checkPrices()
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
        <UButton class="cursor-pointer" color="info" icon="i-ic-baseline-refresh" @click="checkPrices()"/>
      </div>
      <UTable :columns="columns" :data="games" :ui="{td: 'p-1'}" class="w-full" empty="La liste des jeux est vide.">
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
            <UButton color="error" icon="i-ic-baseline-delete" size="xs" @click="dbStore.deleteGame(row.original.id)"/>
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
  </UTabs>
</template>

<style scoped>

</style>