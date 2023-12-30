import { app, Tray, Menu, Notification, nativeImage, NotificationConstructorOptions } from 'electron';
import { exec } from 'child_process';
import path, { join, basename, resolve } from 'path';
import { promisify } from 'util';
import findProcess from 'find-process';
import os from 'os';
import dotenv from 'dotenv';
import AutoLaunch from 'auto-launch';
import storage from 'node-persist';
import log4js from 'log4js';

const logsDir = app.getPath('logs');
const logFileName = path.join(logsDir, 'combined.log');

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: logFileName,
      pattern: '.yyyy-MM-dd',
      compress: true,
      maxLogSize: 10485760, // 10 MB
      backups: 3 // keep last 3 backup files
    },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'debug' }
  }
});
var logger = log4js.getLogger();

logger.info('Starting application');
logger.info('logs file name', logFileName);


dotenv.config();


let tray: Tray | undefined;
let contextMenu: Electron.Menu | undefined;
let restartNotification: Notification | undefined;
let autoLauncher = new AutoLaunch({ name: 'WorkSmartNotifier' });

let processFullPath = process.env.WORKSMART_PROCESS_PATH;
let defaultTimeout = 15_000;
const title = 'WorkSmart Notifier' as const;

const appDir = app.getPath('userData');
logger.info('appDir', appDir);




function getPath(filePath: string) {
  return resolve(join(__dirname, filePath));
}

// let notificationIcon = nativeImage.createFromPath(getPath('../images/Checker_256.png'));
// let disabledNotificationIcon = nativeImage.createFromPath(getPath('../images/Checker_256_disabled.png'));
let notificationIcon = path.join(__dirname, '../images/Checker_256.png');
let disabledNotificationIcon = path.join(__dirname, '../images/Checker_256_disabled.png');
let iconPath = notificationIcon;
logger.info('iconPath', iconPath);

const notificationObject: Pick<NotificationConstructorOptions, 'title' | 'icon'> = {
  title,
  icon: notificationIcon,
}

let execAsync = promisify(exec);

if (!processFullPath) {
  switch (os.platform()) {
    case 'win32':
      processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';
      break;
    default:
      throw new Error('Unsupported platform, please use WORKSMART_PROCESS_PATH to define path to the application.');
  }
}

let processName = basename(processFullPath);

async function createTray() {
  logger.info('creating tray');
  tray = new Tray(iconPath);
  logger.info('setting up tray');
  tray.setToolTip(title);
  contextMenu = Menu.buildFromTemplate([
    {
      id: 'checker',
      label: 'Is checking',
      toolTip: 'if checked, will check if the process is running',
      type: 'checkbox',
      checked: true,
      click: () => {
        if (hasChecks()) {
          stopProcessChecks();
        } else {
          setupProcessChecks(1_000);
        }
        updateCheckerTray()
      },
    },
    {
      id: 'autostart',
      label: 'Autostart',
      toolTip: 'if checked, will start on user login',
      type: 'checkbox',
      checked: await autoLauncher.isEnabled(),
      click: async () => {
        if (await autoLauncher.isEnabled()) {
          autoLauncher.disable();
          await storage.setItem('autoStart', false);
        } else {
          autoLauncher.enable();
          await storage.setItem('autoStart', true);
        }
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
  logger.info('tray created');
}

function updateCheckerTray() {
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

let lastTimeout: NodeJS.Timeout | undefined;

function hasChecks(): boolean {
  return Boolean(lastTimeout);
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

async function startProcessChecks() {
  try {
    stopProcessChecks(true);
    logger.info('process checks started');
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      logger.info(`${processName} is not running`);
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
        updateCheckerTray();
      });
      restartNotification.show();
    } else {
      logger.info(`${processName} is running`);
    }
  } catch (err) {
    logger.error(`Could not check process status: ${err}`);
  }
  setupProcessChecks();
}

function setupProcessChecks(timeout = defaultTimeout) {
  lastTimeout = setTimeout(startProcessChecks, timeout);
}

function notificationStart() {
  logger.info('notification start');
  const notification = new Notification({
    ...notificationObject,
    body: 'Notifier started',
    silent: true,
  });
  notification.show();
  logger.info('notification finished');
}

app.on('ready', async () => {
  logger.info('Ready triggered (on)');
  if (app.isReady()) {
    onReady();
  } else {
    app.on('ready', onReady);
  }
});
app.whenReady().then(() => {
  logger.info('Ready triggered (whenReady)');
}).then(onReady);

let isExecuted = false;

async function onReady() {
  try {
    if (isExecuted) {
      return;
    }
    isExecuted = true;
    logger.info('App is ready');
    app.setAppUserModelId(title);
    logger.info('appUserModelId set');
    await storage.init({ dir: appDir });
    logger.info('storage initialized');
    const autoStart = await storage.getItem('autoStart');
    logger.info('autoStart', autoStart);
    const autoLauncherEnabled = await autoLauncher.isEnabled();
    logger.info('autoStart', autoStart, 'autoLauncherEnabled', autoLauncherEnabled)
    if (autoStart === undefined || autoStart && !autoLauncherEnabled) {
      autoLauncher.enable();
      logger.info('autoLauncher enabled');
    }
    logger.info('autostart finished');
    await createTray();
    notificationStart();
    setupProcessChecks(5_000);
    logger.info('App finished starting');
  } catch (err) {
    logger.error('Error onReady', err);
  }
}