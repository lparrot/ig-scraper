<script lang="ts" setup>
import {useDbStore} from "./stores/db.store";

const dbStore = useDbStore()


</script>

<template>
  <Suspense>
    <template #fallback>
      <div class="loading">Loading...</div>
    </template>

    <UApp>
      <div class="p-4">
        <RouterView/>
      </div>
    </UApp>
  </Suspense>
</template>

<style scoped>

</style>