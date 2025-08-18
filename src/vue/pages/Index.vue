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
]

const state = reactive({
  file: null as File | null,
  pageContent: '',
})

async function importFile(file: File | null) {
  if (!file) return
  state.pageContent = await file.text()
  state.file = null
}

async function scrapPage() {
  scrapStore.scrap(state.pageContent)
  state.pageContent = ''
}

await dbStore.fetchGames()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <UButton @click="dbStore.clearGames()">Supprimer tous les jeux</UButton>
    </div>

    <div class="flex items-center gap-4">
      Charger un fichier:
      <UFileUpload v-model="state.file" variant="button" @change="importFile(state.file)"/>
    </div>

    <div>
      <UTextarea v-model="state.pageContent" :rows="20" class="w-full"></UTextarea>
    </div>

    <div>
      <UButton @click="scrapPage">Charger la liste des jeux</UButton>
    </div>

    <UTable :columns="columns" :data="games" class="w-full">
      <template #image-cell="{row}">
        <img :alt="`${row.original.name} image`" :src="row.original.image" size="lg"></img>
      </template>

      <template #name-cell="{row}">
        <span>{{ row.original.name }}</span>
      </template>
    </UTable>
  </div>
</template>

<style scoped>

</style>