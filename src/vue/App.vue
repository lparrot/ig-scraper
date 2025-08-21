<script lang="ts" setup>
import {useToast} from "@nuxt/ui/composables/useToast";
import {NavigationMenuItem} from "@nuxt/ui/components/NavigationMenu.vue";
import {addLog} from "./utils/app.utils";

const toast = useToast()

function createUpdaterNotification(options: Partial<Toast>) {
  if (toast.toasts.value.some(t => t.id === 'toast-updater')) {
    toast.update('toast-updater', options)
  } else {
    toast.add({
      id: 'toast-updater',
      ...options
    })
  }
}

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
  createUpdaterNotification({description: 'Vérification des mises à jour en cours...', duration: 0, color: 'info'})
})

window.electron.on('autouploader:update-available', (info) => {
  console.log('Update available:', info)
  createUpdaterNotification({
    description: `La mise à jour vers la version ${info.version} est disponible.`, color: 'success', duration: 0, actions: [
      {
        label: 'Télécharger',
        icon: 'i-ic-baseline-download',
        color: 'primary',
        variant: 'solid',
        onClick: async () => {
          await window.electron.invoke('autouploader:download-update')
          createUpdaterNotification({description: 'Téléchargement de la mise à jour en cours...', duration: 0, color: 'info'})
        }
      },
      {
        label: 'Ignorer',
        icon: 'i-ic-baseline-close',
        color: 'secondary',
        onClick: () => {
          toast.remove('toast-updater')
        }
      }
    ]
  })
})

window.electron.on('autouploader:update-not-available', (info) => {
  console.log('Update not available:', info)
  createUpdaterNotification({description: 'Aucune mise à jour disponible.', duration: 0, color: 'info'})
})

window.electron.on('autouploader:download-progress', (info) => {
  console.log('Download progress:', info)
  createUpdaterNotification({description: `Mise à jour en cours. (${info.percent.toFixed(2)} %)`, duration: 0, color: 'info'})
})

window.electron.on('autouploader:error', (payload) => {
  console.log(payload)
  addLog('Erreur lors de la vérification de mise à jour: ' + payload.message, 'error')
  createUpdaterNotification({description: 'Erreur lors de la vérification de mise à jour.', duration: 0, color: 'error'})
})

window.electron.on('autouploader:update-downloaded', (info) => {
  console.log('Update downloaded:', info)
  addLog(`La mise à jour ${info.version} a été téléchargée.`)
  createUpdaterNotification({
    description: 'Mise à jour téléchargée.', duration: 0, color: 'success', actions: [
      {
        label: 'Redémarrer',
        icon: 'i-ic-baseline-restart-alt',
        color: 'primary',
        variant: 'solid',
        onClick: async () => {
          await window.electron.invoke('autouploader:quit-and-install')
        }
      },
      {
        label: 'Plus tard',
        icon: 'i-ic-baseline-close',
        color: 'secondary',
        onClick: () => {
          toast.remove('toast-updater')
        }
      }
    ]
  })
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