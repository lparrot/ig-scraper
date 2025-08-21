<script lang="ts" setup>
import {useToast} from "@nuxt/ui/composables/useToast";

const toast = useToast()

window.electron.on('autouploader:checking-for-update', () => {
  console.log('Checking for updates...')
  toast.add({id: 'toast-updater', description: 'Vérification des mises à jour en cours...', color: 'info'})
})

window.electron.on('autouploader:update-available', (info) => {
  console.log('Update available:', info)
  toast.update('toast-updater', {description: 'Mise à jour disponible.', color: 'success'})
})

window.electron.on('autouploader:update-not-available', (info) => {
  console.log('Update not available:', info)
  toast.update('toast-updater', {description: 'Aucune mise à jour disponible.', color: 'info'})
})

window.electron.on('autouploader:download-progress', (info) => {
  console.log('Download progress:', info)
  toast.update('toast-updater', {description: `Mise à jour en cours. (${info.progress} %)`, color: 'info'})
})

window.electron.on('autouploader:error', (payload) => {
  console.error('Update error:', payload)
  toast.update('toast-updater', {description: 'Erreur lors de la vérification de mise à jour.', color: 'error'})
})

window.electron.on('autouploader:update-downloaded', (payload) => {
  console.log('Update downloaded:', payload)
  toast.update('toast-updater', {description: 'Mise à jour téléchargée.', color: 'success'})
})

// Envoi d'un message à l'application pour indiquer que l'application est prête
window.electron.send('app:ready')
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