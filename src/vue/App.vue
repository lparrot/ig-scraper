<script lang="ts" setup>
import {onMounted} from "vue";
import {useDbStore} from "./stores/db.store";

const dbStore = useDbStore()

onMounted(async () => {
  setInterval(async () => {
    await dbStore.checkPrices()
  }, 1000 * 60 * 10)
});
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