import {dialog, ipcMain, MessageBoxOptions, NotificationConstructorOptions} from "electron";
import {ELECTRON_UTILS} from "./electron.utils";
import {Game} from "../vue/db/db";
import * as fs from "node:fs";

ipcMain.handle('notification:send', async (event, options: NotificationConstructorOptions) => {
  ELECTRON_UTILS.notification.send(options);
})

ipcMain.handle('messageBox:show', async (event, options: MessageBoxOptions) => {
  return dialog.showMessageBox(options);
})

ipcMain.handle('data:export', async (event, games: Game[]) => {
  // Affichage d'une boîte de dialogue pour choisir le fichier d'exportation
  // Si l'utilisateur annule, on ne fait rien
  if (!games || games.length === 0) {
    await dialog.showMessageBox({
      title: "Aucun jeu à exporter",
      message: "Il n'y a pas de jeux à exporter.",
      type: 'warning',
      buttons: ['OK']
    })
    return false;
  }

  const filename = dialog.showSaveDialogSync({
    title: 'Exporter les jeux',
    defaultPath: 'exported_games.json',
    buttonLabel: 'Enregistrer',
    filters: [
      {name: 'JSON', extensions: ['json']}
    ]
  })

  if (filename != null) {
    // Suppression des champs inutiles
    games = games.map((game) => {
      delete game.id;
      delete game.price;
      delete game.prices;
      delete game.priceChange;
      return game;
    })

    // Écriture du fichier
    fs.writeFileSync(filename, JSON.stringify(games), {encoding: 'utf-8'})

    // Affichage d'une notification de succès
    await dialog.showMessageBox({
      title: "Exportation réussie",
      message: `Les jeux ont été exportés vers ${filename}`,
      type: 'info',
      buttons: ['OK']
    })
  }
  return true
})

ipcMain.handle('data:import', async (event) => {
  const filename = dialog.showOpenDialogSync({
    title: 'Importer des jeux',
    buttonLabel: 'Ouvrir',
    properties: ['openFile'],
    filters: [
      {name: 'JSON', extensions: ['json']}
    ]
  })

  if (filename != null && filename.length) {
    try {
      return JSON.parse(fs.readFileSync(filename[0], {encoding: 'utf-8'}))
    } catch (error) {
      console.error("Erreur lors de l'importation des jeux :", error);
      await dialog.showMessageBox({
        title: "Erreur d'importation",
        message: "Le fichier sélectionné n'est pas un fichier JSON valide.",
        type: 'error',
        buttons: ['OK']
      });
    }
  }
})

function checkCallback(callback: any) {
  return typeof callback == "function" ? callback : () => {
  }
}