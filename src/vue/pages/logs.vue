<script lang="ts" setup>
import {useDbStore} from "../stores/db.store";
import {storeToRefs} from "pinia";
import {TableColumn} from "@nuxt/ui";
import {Log} from "../db/db";

const dbStore = useDbStore()

const {logs} = storeToRefs(dbStore)

// Colonnes pour le tableau des logs
const columns_logs: TableColumn<Log>[] = [
  {accessorKey: 'date', header: 'Date'},
  {accessorKey: "level", header: 'Niveau'},
  {accessorKey: 'message', header: 'Message'},
  {accessorKey: 'type', header: 'Type'},
]
</script>

<template>
  <UTable :columns="columns_logs" :data="logs" :ui="{td: ['p-1']}" class="w-full h-full" empty="Aucun log disponible.">
    <template #date-cell="{row}">
      <span>{{ new Date(row.original.date).toLocaleString() }}</span>
    </template>

    <template #level-cell="{row}">
      <UBadge :color="row.original.level as any" variant="soft">{{ row.original.level }}</UBadge>
    </template>
  </UTable>
</template>

<style scoped>

</style>