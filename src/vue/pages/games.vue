<script lang="ts" setup>
import {useDbStore} from "../stores/db.store";
import {storeToRefs} from "pinia";
import {reactive} from "vue";
import type {FormSubmitEvent, TableColumn} from "@nuxt/ui";
import {Game} from "../db/db";
import {z} from "zod";
import {addLog} from "../utils/app.utils";

type SchemaAddNewGame = z.infer<typeof schemaNewGame>

const dbStore = useDbStore()
const {games} = storeToRefs(dbStore)

// Colonnes pour le tableau des jeux
const columns_games: TableColumn<Game>[] = [
  {accessorKey: 'image', header: 'Image'},
  {accessorKey: 'name', header: 'Nom'},
  {accessorKey: 'price', header: 'Prix actuel'},
  {accessorKey: 'lastPrice', header: 'Dernier prix'},
  {accessorKey: 'other', header: ''},
  {accessorKey: 'actions', header: ''},
]

// État réactif pour les modals
const modals = reactive({
  addNewGame: false
})

// État réactif pour le formulaire d'ajout de jeu
const formNewGame = reactive<Partial<SchemaAddNewGame>>({
  url: ''
})

// Schéma de validation pour l'ajout d'un nouveau jeu
const schemaNewGame = z.object({
  url: z.url(),
})

// Méthode pour ajouter un nouveau jeu
async function addNewGame(event: FormSubmitEvent<SchemaAddNewGame>) {
  const game = await dbStore.addGameByUrl(event.data.url)
  addLog(`Le jeu ${game.name} a été ajouté avec succès depuis l'URL: ${event.data.url}`)
  modals.addNewGame = false
}

// Méthode pour ouvrir un lien dans le navigateur
async function openInBrowser(url: string) {
  await window.app.openInBrowser(url)
}

// Méthode pour supprimer un jeu
function deleteGame(game: Game) {
  dbStore.deleteGame(game.id)
  addLog(`Le jeu ${game.name} a été supprimé.`)
}

// Méthode pour vérifier les prix des jeux. Cette méthode va mettre à jour les prix des jeux dans la base de données et afficher un message de confirmation
async function checkPrices() {
  await dbStore.checkPrices()
  addLog('Les prix des jeux ont été vérifiés et mis à jour.')
  await window.app.messageBox({
    title: 'Vérification des prix',
    message: `Les prix des jeux ont été mis à jour.`,
    type: 'info',
  })
}
</script>

<template>
  <div class="flex items-center gap-2 overflow-hidden">
    <UButton class="cursor-pointer" icon="i-ic-baseline-plus" label="Ajouter un jeu" @click="modals.addNewGame = true"/>
    <UButton class="cursor-pointer" icon="i-ic-baseline-refresh" label="Vérifier les prix" @click="checkPrices()"/>
  </div>

  <UTable :columns="columns_games" :data="games" :ui="{td: 'p-1'}" class="w-full h-full" empty="La liste des jeux est vide." sticky>
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