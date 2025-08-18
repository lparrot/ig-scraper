// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, shell} from 'electron'

contextBridge.exposeInMainWorld('app', {
    openInBrowser: async (url: string) => {
        await shell.openExternal(url)
    }
})

declare global {
    interface Window {
        app: {
            openInBrowser: (url: string) => Promise<void>
        }
    }
}