import {autoUpdater} from "electron-updater";
import {win} from "./main";

autoUpdater.on('checking-for-update', () => {
  win.webContents.send('autouploader:checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  win.webContents.send('autouploader:update-available', info)
})

autoUpdater.on('update-not-available', (info) => {
  win.webContents.send('autouploader:update-not-available', info)
})

autoUpdater.on('error', (err, message) => {
  win.webContents.send('autouploader:error', {err, message})
})

autoUpdater.on('download-progress', info => {
  win.webContents.send('autouploader:download-progress', info)
})

autoUpdater.on('update-downloaded', (info) => {
  win.webContents.send('autouploader:update-downloaded', info)
})