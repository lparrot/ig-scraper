<script lang="ts" setup>
import {useScrapStore} from "../stores/scrap.store";
import {reactive, toRaw} from "vue";
import {addLog} from "../utils/app.utils";
import {storeToRefs} from "pinia";
import {useDbStore} from "../stores/db.store";
import {useRouter} from "vue-router";

const dbStore = useDbStore()
const scrapStore = useScrapStore()
const router = useRouter()

const {games} = storeToRefs(dbStore)

// Etat réactif pour le composant
const state = reactive({
  file: null as File | null,
  whishlistContent: '',
})

// Méthode pour importer un fichier contenant la wishlist
async function importFile(file: File | null) {
  if (!file) return
  state.whishlistContent = await file.text()
  state.file = null
}

// Méthode pour scrapper la page de la wishlist
// Cette méthode va extraire les informations de la wishlist et les ajouter à la base de données
async function scrapPage() {
  await scrapStore.scrapWhishlist(state.whishlistContent)
  await router.push({name: 'games'})
  state.whishlistContent = ''
  addLog('La liste de jeux a été chargée depuis le contenu de la wishlist.')
  await window.app.messageBox({
    title: 'Importation réussie',
    message: `La liste de jeux a été importée avec succès.`,
    type: 'info',
  })
}

// Méthode pour exporter les jeux dans un fichier JSON
async function exportGames() {
  await window.electron.invoke('data:export', toRaw(games.value))
}

// Méthode pour importer des jeux depuis un fichier JSON
async function importGames() {
  const importedGames = await window.electron.invoke('data:import')

  if (importedGames) {
    await dbStore.importGames(importedGames)
    addLog(`${importedGames.length} jeux ont été importés avec succès via un fichier JSON.`)
    await router.push({name: 'games'})
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
}
</script>

<template>
  <div class="h-full flex flex-col gap-4">
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

<style scoped>

</style>