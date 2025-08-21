<script lang="ts" setup>
import {useToast} from "@nuxt/ui/composables/useToast";
import {NavigationMenuItem} from "@nuxt/ui/components/NavigationMenu.vue";

const toast = useToast()

const navigation_menu: NavigationMenuItem[] = [
  {
    label: 'Menu',
    type: 'label'
  },
  {
    label: 'Jeux',
    icon: 'i-ic-baseline-gamepad',
    to: {name: 'games'},
  },
  {
    label: 'Administration',
    icon: 'i-ic-baseline-settings',
    to: {name: 'admin'},
  },
  {
    label: 'Logs',
    icon: 'i-ic-twotone-insert-drive-file',
    to: {name: 'logs'},
  },
]

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
      <div class="flex flex-col w-full items-center overflow-hidden">
        <UNavigationMenu :items="navigation_menu" class="min-w-60"/>
      </div>

      <hr class="my-2 border-default">

      <RouterView/>
    </UApp>
  </Suspense>
</template>

<style scoped>

</style>