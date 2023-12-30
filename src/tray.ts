import { Tray, Menu } from 'electron';
import { processName } from './env';
import { autoLaunchTrigger, hasAutoLaunch } from './autoLaunch';
import { isCheckingTrigger } from './processChecks';
import logger from './logger';
import { disabledNotificationIcon, notificationIcon } from './images';

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
      click: () => isCheckingTrigger(contextMenu, tray),
    },
    {
      id: 'autostart',
      label: 'Autostart',
      type: 'checkbox',
      checked: await hasAutoLaunch(),
      click: autoLaunchTrigger,
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

export function updateCheckerTray(checksEnabled: boolean) {
  logger.info('updating checker tray');
  if (!contextMenu) {
    logger.info('no context menu');
    return;
  }
  const checker = contextMenu.getMenuItemById('checker');
  if (!checker) {
    logger.info('no checker');
    return;
  }
  checker.checked = checksEnabled;
  tray?.setImage(checksEnabled ? notificationIcon : disabledNotificationIcon);

  logger.info('checker updated');
}