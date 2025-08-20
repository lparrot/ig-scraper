<script lang="ts" setup>
import {nextTick} from 'vue'
import {useToast} from "@nuxt/ui/composables/useToast";

const toast = useToast()

nextTick(() => {
  window.electron.on('autouploader:checking-for-update', () => {
    console.log('Checking for updates...')
    toast.add({
      description: 'Vérification des mises à jour en cours...',
      color: 'info',
    })
  })

  window.electron.on('autouploader:update-not-available', () => {
    console.log('No update available')
    toast.add({
      description: 'Aucune mise à jour disponible.',
      color: 'success',
    })
  })

  window.electron.on('autouploader:error', (payload) => {
    console.error('Error checking for updates', payload)
    toast.add({
      description: 'Erreur lors de la vérification de mise à jour.',
      color: 'error',
    })
  })

  // Envoi d'un message à l'application pour indiquer que l'application est prête
  window.electron.send('app:ready')
})
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