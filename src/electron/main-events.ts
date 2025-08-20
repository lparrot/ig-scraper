import {ipcMain} from "electron";
import {updateElectronApp, UpdateSourceType} from "update-electron-app";

ipcMain.on('app:ready', async () => {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: 'lparrot/ig-webscraping',
    },
    updateInterval: '1 hour',
  })
})

// autoUpdater.on('checking-for-update', () => {
//   console.log('Checking for updates...');
//
//   win.webContents.send('autouploader:checking-for-update')
// })
//
// autoUpdater.on('update-available', (info) => {
//   console.log('Update available. Downloading...', info);
//
//   win.webContents.send('autouploader:checking-for-update', info)
// })
//
// autoUpdater.on('update-not-available', (info) => {
//   console.log('No updates available.', info);
//   win.webContents.send('autouploader:update-not-available', info)
// })
//
// autoUpdater.on('error', (err, message) => {
//   console.error('Error in auto-updater:', err, message);
//
//   win.webContents.send('autouploader:error', {err, message})
// })
//
// autoUpdater.on('download-progress', info => {
//   console.log(`Download progress: ${info.percent}%`);
//
//   win.webContents.send('autouploader:download-progress', info)
// })
//
// autoUpdater.on('update-downloaded', (info) => {
//   console.log('Update downloaded:', info);
//
//   win.webContents.send('autouploader:update-downloaded', info)
//
//   const dialogOpts: MessageBoxOptions = {
//     type: 'info',
//     buttons: ['Redémarrer maintenant', 'Installer plus tard...'],
//     title: 'Mise à jour applicative',
//     message: 'Nouvelle version disponible',
//     detail: `Une nouvelle version a été téléchargée. Redémarrez l'application pour finaliser l'opération.`,
//   }
//
//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// })