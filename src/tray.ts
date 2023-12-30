import { Tray, Menu } from 'electron';
import { processName } from './env';
import { autoLauncher, configureAutoLaunch } from './autoLaunch';
import { hasChecks, setupProcessChecks, stopProcessChecks, updateCheckerTray } from './processChecks';
import logger from './logger';
import { notificationIcon } from './images';

let tray: Tray | undefined;
let contextMenu: Electron.Menu | undefined;

export async function createTray(app: Electron.App) {
  tray = new Tray(notificationIcon);
  tray.setToolTip(processName);

  contextMenu = Menu.buildFromTemplate([
    {
      id: 'checker',
      label: 'Is checking',
      type: 'checkbox',
      checked: true,
      click: () => {
        if (hasChecks()) {
          stopProcessChecks();
        } else {
          setupProcessChecks(contextMenu, tray, 1_000);
        }
        updateCheckerTray(contextMenu, tray)
      },
    },
    {
      id: 'autostart',
      label: 'Autostart',
      type: 'checkbox',
      checked: await autoLauncher.isEnabled(),
      click: async () => {
        await configureAutoLaunch();
      },
    },
    {
      label: 'Quit', click: () => {
        logger.info('Exiting application');
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  return { tray, contextMenu }
}