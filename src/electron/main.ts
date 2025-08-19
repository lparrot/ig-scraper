import {app, BrowserWindow, Menu, nativeImage, shell, Tray} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import './main-handlers'

const isDevelopment = !app.isPackaged

process.env.ROOT = path.join(__dirname, '..', '..')
process.env.ASSETS = path.join(process.env.ROOT, 'src', 'electron', 'assets')

let tray: Tray
let win: BrowserWindow
const iconPath = isDevelopment ? path.join(process.env.ASSETS, 'icons', 'icon.ico') : path.join(process.resourcesPath, 'assets', 'icons', 'icon.ico')

// Gérer la création/suppression de raccourcis sous Windows lors de l'installation/désinstallation.
if (started) {
  app.quit();
}

app.setAppUserModelId("Instant Gaming Web Scraping")

async function createWindow() {
  // Création d'une fenêtre de navigateur.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Instant Gaming Web Scraper',
    fullscreenable: false,
    webPreferences: {
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      nodeIntegration: true,
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

/**
 * Configure la fenêtre principale de l'application.
 */
function configureWindow(win: BrowserWindow) {
  win.setIcon(nativeImage.createFromPath(iconPath))

  // Ouverture des outils de développement (DevTools) pour le débogage.
  if (isDevelopment) {
    win.webContents.openDevTools();
  } else {
    win.removeMenu()
  }

  win.on('restore', () => {
    win.maximize()
  })

  function hideWindow(event: any) {
    event.preventDefault()
    win.hide()
    tray = createTray()
  }

  // @ts-ignore
  win.on('minimize', (event: any) => {
    hideWindow(event)
  })

  win.on('close', (event: any) => {
    hideWindow(event)
  })

  win.minimize()
}

/**
 * Crée la barre d'état système (tray) de l'application.
 * La barre d'état système est une icône dans la barre des tâches qui permet à l'utilisateur d'interagir avec l'application sans ouvrir de fenêtre.
 */
const createTray = () => {
  const tray = new Tray(nativeImage.createFromPath(iconPath))

  const contextMenu = Menu.buildFromTemplate([
    {label: `Ouvrir dossier application`, type: 'normal', click: () => shell.openPath(process.env.ROOT)},
    {label: `Quitter l'application`, type: 'normal', click: () => app.exit()},
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Instant-Gaming Webscraper')

  tray.on('double-click', () => {
    win.show()
    tray.destroy()
  })

  return tray
}

// Dans ce fichier, vous pouvez inclure le reste du code spécifique au processus principal de votre application.
// Vous pouvez également les mettre dans des fichiers séparés et les importer ici.