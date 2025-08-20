import {dialog, ipcMain, MessageBoxOptions} from "electron";
import {autoUpdater} from 'electron-updater'
import {win} from "./main";

ipcMain.on('app:ready', async () => {
  await autoUpdater.checkForUpdates()
})

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');

  win.webContents.send('autouploader:checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available. Downloading...', info);
})

autoUpdater.on('update-not-available', (info) => {
  console.log('No updates available.', info);
  win.webContents.send('autouploader:update-not-available')
})

autoUpdater.on('error', (err, message) => {
  console.error('Error in auto-updater:', err, message);
})

autoUpdater.on('download-progress', info => {
  console.log(`Download progress: ${info.percent}%`);
})

autoUpdater.on('update-downloaded', (event) => {
  console.log('Update downloaded:', event);

  const dialogOpts: MessageBoxOptions = {
    type: 'info',
    buttons: ['Redémarrer maintenant', 'Installer plus tard...'],
    title: 'Mise à jour applicative',
    message: 'Nouvelle version disponible',
    detail: `Une nouvelle version a été téléchargée. Redémarrez l'application pour finaliser l'opération.`,
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})