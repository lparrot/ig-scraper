import {ipcMain, NotificationConstructorOptions} from "electron";
import {IGS_ELECTRON} from "./electron.utils";

ipcMain.handle('notification:send', async (event, title: string, body: string, options: NotificationConstructorOptions) => {
    IGS_ELECTRON.notification.send(title, body, options);
    return true;
})