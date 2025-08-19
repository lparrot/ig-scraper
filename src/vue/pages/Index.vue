<script lang="ts" setup>
import {useDbStore} from "../stores/db.store";
import {storeToRefs} from "pinia";
import {reactive} from "vue";
import {useScrapStore} from "../stores/scrap.store";
import type {TableColumn} from "@nuxt/ui";
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

const state = reactive({
  file: null as File | null,
  whishlistContent: '',
})

async function importFile(file: File | null) {
  if (!file) return
  state.whishlistContent = await file.text()
  state.file = null
}

async function scrapPage() {
  await scrapStore.scrapWhishlist(state.whishlistContent)
  state.whishlistContent = ''
  await window.electron.invoke('notification:send', 'Liste de jeux importée', 'La liste de jeux a été importée avec succès.')
}

async function openInBrowser(url: string) {
  await window.app.openInBrowser(url)
}

await dbStore.fetchGames()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <UButton @click="dbStore.clearGames()">Supprimer tous les jeux</UButton>
      <UButton @click="dbStore.checkPrices()">Vérifier prix</UButton>
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

    <UTable :columns="columns" :data="games" class="w-full">
      <template #image-cell="{row}">
        <div @click="openInBrowser(row.original.url)" class="cursor-pointer">
          <img width="100" :alt="`${row.original.name} image`" :src="row.original.image">
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
  </div>
</template>

<style scoped>

</style>