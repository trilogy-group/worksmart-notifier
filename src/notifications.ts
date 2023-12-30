import { Notification, NotificationConstructorOptions } from 'electron';
import logger from './logger';

import { processName } from './env';
import { notificationIcon } from './images';

let restartNotification: Notification | undefined;
const title = 'WorkSmart Notifier' as const;

const notificationObject: Pick<NotificationConstructorOptions, 'title' | 'icon'> = {
  title,
  icon: notificationIcon,
}

export function appStartedNotification() {
  logger.info('notification start');
  const notification = new Notification({
    ...notificationObject,
    body: 'Notifier started',
    silent: true,
  });
  notification.show();
  logger.info('notification finished');
}

export function executeRestartNotification(contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined, restartProcess: () => Promise<void>, stopProcessChecks: () => void, updateCheckerTray: (contextMenu: Electron.Menu | undefined, tray: Electron.Tray | undefined) => void) {
  if (restartNotification) {
    restartNotification.close();
    restartNotification = undefined;
  }
  restartNotification = new Notification({
    ...notificationObject,
    body: `${processName} is not running. Click on message to restart. Click on cross to stop checks.`,
    timeoutType: 'never',
  });
  restartNotification.on('click', (event) => {
    logger.info('click', event);
    restartProcess().then();
  });
  restartNotification.on('close', (event) => {
    logger.info('close', event);
    stopProcessChecks();
    updateCheckerTray(contextMenu, tray);
  });
  restartNotification.show();
}