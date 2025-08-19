// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, ipcRenderer, MessageBoxOptions, NotificationConstructorOptions, shell} from 'electron'

contextBridge.exposeInMainWorld('app', {
  openInBrowser: async (url: string) => {
    await shell.openExternal(url)
  },
  messageBox: async (options: MessageBoxOptions) => {
    return ipcRenderer.invoke('messageBox:show', options)
  },
  notification: async (options: NotificationConstructorOptions) => {
    return ipcRenderer.invoke('notification:send', options)
  }
})

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  once: (channel: string, func: (...args: any[]) => void) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
  removeListener: (channel: string, func: (...args: any[]) => void) => ipcRenderer.removeListener(channel, func),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
})

declare global {
  interface Window {
    app: {
      openInBrowser: (url: string) => Promise<void>
      messageBox: (options: MessageBoxOptions) => Promise<number>
      notification: (options: NotificationConstructorOptions) => Promise<void>
    },
    electron: {
      invoke: (channel: string, ...args: any[]) => Promise<any>,
      send: (channel: string, ...args: any[]) => void,
      on: (channel: string, func: (...args: any[]) => void) => void,
      once: (channel: string, func: (...args: any[]) => void) => void,
      removeListener: (channel: string, func: (...args: any[]) => void) => void,
      removeAllListeners: (channel: string) => void,
    }
  }
}