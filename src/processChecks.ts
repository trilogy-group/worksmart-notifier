import { exec } from 'child_process';
import findProcess from 'find-process';
import { promisify } from 'util';
import logger from './logger';
import { processFullPath, processName } from './env';
import { executeRestartNotification } from './notifications';
import { disabledNotificationIcon, notificationIcon } from './images';

const execAsync = promisify(exec);
const defaultTimeout = 15_000;
let lastTimeout: NodeJS.Timeout | undefined;

export function hasChecks(): boolean {
  return Boolean(lastTimeout);
}

export function stopProcessChecks(cleanup: boolean = false) {
  if (lastTimeout) {
    clearTimeout(lastTimeout);
    if (!cleanup) {
      lastTimeout = undefined;
    } else {
      logger.info('stopped process checks');
    }
    return true;
  }
  return false;
}

export function setupProcessChecks(contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined, timeout = defaultTimeout) {
  lastTimeout = setTimeout(startProcessChecks(contextMenu, tray), timeout);
}

function startProcessChecks(contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined) {
  return async () => {
    try {
      stopProcessChecks(true);
      logger.info('process checks started');
      const list = await findProcess('name', processName);
      if (list.length === 0) {
        logger.info(`${processName} is not running`);
        executeRestartNotification(contextMenu, tray, restartProcess, stopProcessChecks, updateCheckerTray);
      } else {
        logger.info(`${processName} is running`);
      }
    } catch (err) {
      logger.error(`Could not check process status: ${err}`);
    }
    setupProcessChecks(contextMenu, tray);
  }
}

export function updateCheckerTray(contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined) {
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
  const checksEnabled = hasChecks()
  checker.checked = checksEnabled;
  tray?.setImage(checksEnabled ? notificationIcon : disabledNotificationIcon);

  logger.info('checker updated');
}

async function restartProcess() {
  logger.info('restarting', processFullPath)
  try {
    const { stdout } = await execAsync(`"${processFullPath}"`);
    logger.info(`Restarted process stdout:`, stdout);
  } catch (err) {
    logger.error(`Could not restart ${processName}: ${err}`);
  }
}