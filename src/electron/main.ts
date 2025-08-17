import {app, BrowserWindow, Tray, Menu, nativeImage} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {IGS_ELECTRON} from "./electron.utils";

const isDevelopment = process.env.NODE_ENV === 'development'
const rootDir = path.join(__dirname, '..', '..')

const devAssetsPath = path.join(rootDir, 'src', 'electron', 'assets', 'icons', 'icon.ico')

const iconPath = isDevelopment ? devAssetsPath : path.join(process.resourcesPath, 'assets', 'icons', 'icon.ico')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

app.setAppUserModelId("Instant Gaming Web Scraping")

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    createTray()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
    .then(() => {
        createWindow();

        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    })
    .then(() => {
        // IGS_ELECTRON.notification.send('Application démarrée', `L'application IG Webscraping est démarrée`)
    });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const createTray = () => {
    const tray = new Tray(nativeImage.createFromPath(iconPath))

    const contextMenu = Menu.buildFromTemplate([
        {label: `Quitter l'application`, type: 'normal', click: () => app.quit()}
    ])

    tray.setContextMenu(contextMenu)
    tray.setToolTip('Instant-Gaming Webscraper')
}