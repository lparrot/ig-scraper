import {app, BrowserWindow, dialog, Menu, nativeImage, shell, Tray} from 'electron';
import path from 'node:path';
import './main-handlers'
import './main-events'
import {autoUpdater} from "electron-updater";

export let tray: Tray
export let win: BrowserWindow

// Garantie que l'instance est executée qu'une seule fois
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Si l'application est déjà ouverte, on affiche la fenêtre principale.
    if (win != null) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })
}

autoUpdater.autoDownload = false

const isDevelopment = !app.isPackaged
const showDevTools = true || isDevelopment

process.env.ROOT = path.join(__dirname, '..', '..')
process.env.ASSETS = path.join(process.env.ROOT, 'extra')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const iconPath = isDevelopment ? path.join(process.env.ASSETS, 'icons', 'icon.ico') : path.join(process.resourcesPath, 'extra', 'icons', 'icon.ico')

app.setAppUserModelId("Instant Gaming Web Scraping")

async function createWindow() {
  const splashWindow = new BrowserWindow({
    width: 500,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await splashWindow.loadFile(path.join(process.env.ROOT, 'extra', 'html', 'splash.html'))
  } else {
    await splashWindow.loadFile(path.join(process.resourcesPath, 'extra', 'html', 'splash.html'))
  }

  // Création d'une fenêtre de navigateur.
  win = new BrowserWindow({
    width: 0,
    height: 0,
    title: 'Instant Gaming Web Scraper',
    fullscreenable: false,
    webPreferences: {
      devTools: showDevTools,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
  });

  // Permet de cacher la fenêtre principale au démarrage
  // et de la redimensionner plus tard.
  // Cela permet d'afficher la fenêtre de démarrage (splash screen) pendant le chargement de l'application.
  win.hide()
  win.center()
  win.setSize(1024, 768)

  configureWindow(win)

  // Chargement du fichier index.html de l'application.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  splashWindow.destroy()

  win.maximize()
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
  .then(async () => {
    tray = createTray()

    await autoUpdater.checkForUpdates()
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

  dialog.showMessageBox({
    type: 'error',
    title: 'Erreur',
    message: 'Une erreur inattendue est survenue.',
    detail: `Détails de l'erreur : ${error.message}`,
    buttons: ['OK']
  }).then(() => {
    app.exit(1);
  })
})

/**
 * Configure la fenêtre principale de l'application.
 */
function configureWindow(win: BrowserWindow) {
  win.setIcon(nativeImage.createFromPath(iconPath))
  win.removeMenu()

  // Ouverture des outils de développement (DevTools) pour le débogage.
  if (showDevTools) {
    win.webContents.openDevTools();
  }

  win.on('restore', () => {
    win.maximize()
  })

  function hideWindow(event: any) {
    event.preventDefault()
    win.hide()
  }

  // @ts-ignore
  win.on('minimize', (event: any) => {
    hideWindow(event)
  })
}

/**
 * Crée la barre d'état système (tray) de l'application.
 * La barre d'état système est une icône dans la barre des tâches qui permet à l'utilisateur d'interagir avec l'application sans ouvrir de fenêtre.
 */
const createTray = () => {
  const tray = new Tray(nativeImage.createFromPath(iconPath))

  const contextMenu = Menu.buildFromTemplate([
    {label: `Ouvrir dossier application`, type: 'normal', click: () => shell.openPath(process.env.ROOT)},
    {label: `Vérifier les mises à jour`, type: 'normal', click: () => autoUpdater.checkForUpdates()},
    {label: `Quitter l'application`, type: 'normal', click: () => app.exit()},
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Instant-Gaming Webscraper')

  tray.on('double-click', () => {
    win.show()
  })

  return tray
}

// Dans ce fichier, vous pouvez inclure le reste du code spécifique au processus principal de votre application.
// Vous pouvez également les mettre dans des fichiers séparés et les importer ici.