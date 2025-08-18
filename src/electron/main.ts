import {app, BrowserWindow, Menu, nativeImage, shell, Tray} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

const isDevelopment = !app.isPackaged

process.env.ROOT = path.join(__dirname, '..', '..')
process.env.ASSETS = path.join(process.env.ROOT, 'src', 'electron', 'assets')

const iconPath = isDevelopment ? path.join(process.env.ASSETS, 'icons', 'icon.ico') : path.join(process.resourcesPath, 'assets', 'icons', 'icon.ico')

// Gérer la création/suppression de raccourcis sous Windows lors de l'installation/désinstallation.
if (started) {
    app.quit();
}

app.setAppUserModelId("Instant Gaming Web Scraping")

async function createWindow() {
    // Création d'une fenêtre de navigateur.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            devTools: !app.isPackaged,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        },
    });

    configureWindow(win)

    // Chargement du fichier index.html de l'application.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        await win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        await win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Ouuverture des outils de développement (DevTools) pour le débogage.
    if (isDevelopment) {
        win.webContents.openDevTools();
    }
}

// Cette fonction est appelée lorsque Electron a terminé l'initialisation et est prêt à créer des fenêtres de navigateur.
// Certaines API ne peuvent être utilisées qu'après cet événement.
// Notez que dans le processus principal, vous ne pouvez pas utiliser les API de l'interface utilisateur avant que l'événement `ready` ne soit émis.
app.whenReady()
    .then(async () => {
        await createWindow();

        // Sur macOS, il est courant de recréer une fenêtre dans l'application lorsque l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
        app.on('activate', async () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                await createWindow();
            }
        });
    })
    .then(() => {
        // IGS_ELECTRON.notification.send('Application démarrée', `L'application IG Webscraping est démarrée`)
    });

// Quitter l'application lorsque toutes les fenêtres sont fermées, sauf sur macOS. Là-bas, il est courant que les applications
// et leur barre de menu restent actives jusqu'à ce que l'utilisateur quitte explicitement avec Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('uncaughtException', (error) => {
    console.error(error)
})

function configureWindow(win: BrowserWindow) {
    win.maximize()
    win.setIcon(nativeImage.createFromPath(iconPath))
    createTray()
}

const createTray = () => {
    const tray = new Tray(nativeImage.createFromPath(iconPath))

    const contextMenu = Menu.buildFromTemplate([
        {label: `Ouvrir dossier application`, type: 'normal', click: () => shell.openPath(process.env.ROOT)},
        {label: `Quitter l'application`, type: 'normal', click: () => app.quit()},
    ])

    tray.setContextMenu(contextMenu)
    tray.setToolTip('Instant-Gaming Webscraper')
}

// Dans ce fichier, vous pouvez inclure le reste du code spécifique au processus principal de votre application.
// Vous pouvez également les mettre dans des fichiers séparés et les importer ici.