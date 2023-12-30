import { exec } from 'child_process';
import findProcess from 'find-process';
import { promisify } from 'util';
import logger from './logger';
import { processFullPath, processName } from './env';
import { executeRestartNotification } from './notifications';
import { updateCheckerTray } from './tray';

const execAsync = promisify(exec);
const defaultTimeout = 15_000;
let lastTimeout: NodeJS.Timeout | undefined;

export function isCheckingTrigger(contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined) {
  const checks = hasChecks();
  if (checks) {
    stopProcessChecks();
  } else {
    setupProcessChecks(1_000);
  }
  updateCheckerTray(checks)
}

function hasChecks(): boolean {
  return Boolean(lastTimeout);
}

function updateCheckerTrayWrapper() {
  updateCheckerTray(hasChecks());
}

function stopProcessChecks(cleanup: boolean = false) {
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

export function setupProcessChecks(timeout = defaultTimeout) {
  lastTimeout = setTimeout(startProcessChecks(), timeout);
}

function startProcessChecks() {
  return async () => {
    try {
      stopProcessChecks(true);
      logger.info('process checks started');
      const list = await findProcess('name', processName);
      if (list.length === 0) {
        logger.info(`${processName} is not running`);
        executeRestartNotification(restartProcess, stopProcessChecks, updateCheckerTrayWrapper);
      } else {
        logger.info(`${processName} is running`);
      }
    } catch (err) {
      logger.error(`Could not check process status: ${err}`);
    }
    setupProcessChecks();
  }
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