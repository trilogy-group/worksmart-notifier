import { app, BrowserWindow, Tray, Menu, Notification, nativeImage, NotificationConstructorOptions } from 'electron';
import { exec } from 'child_process';
import { join, basename, resolve } from 'path';
import { promisify } from 'util';
import findProcess from 'find-process';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | undefined;
let tray: Tray | undefined;
let contextMenu: Electron.Menu | undefined;
let restartNotification: Notification | undefined;

let processFullPath = process.env.WORKSMART_PROCESS_PATH;
let defaultTimeout = 15_000;
const title = 'WorkSmart Notifier' as const;

function getPath(filePath: string) {
  return resolve(join(process.pkg ? process.pkg.defaultEntrypoint : __dirname, filePath));
}

let notificationIcon = nativeImage.createFromPath(getPath('../images/Checker_256.png'));
let disabledNotificationIcon = nativeImage.createFromPath(getPath('../images/Checker_256_disabled.png'));
let iconPath = notificationIcon;

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

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     title,
//     width: 800,
//     height: 600,
//     icon: iconPath,
//     webPreferences: {
//       nodeIntegration: true,
//     }
//   });

//   mainWindow.loadFile(getPath('../public/index.html'));

//   mainWindow.on('closed', () => {
//     mainWindow = undefined;
//   });
// }

function createTray() {
  tray = new Tray(iconPath);
  tray.setToolTip(title);
  contextMenu = Menu.buildFromTemplate([
    {
      id: 'checker',
      label: 'Is checking',
      toolTip: 'if checked, will check if the process is running',
      type: 'checkbox',
      checked: true,
      click: async () => {
        if (hasChecks()) {
          stopProcessChecks();
        } else {
          await startProcessChecks();
        }
        updateCheckerTray()
      },
    },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
}

function updateCheckerTray() {
  console.log('updating checker tray');
  if (!contextMenu) {
    console.log('no context menu');
    return;
  }
  const checker = contextMenu.getMenuItemById('checker');
  if (!checker) {
    console.log('no checker');
    return;
  }
  const checksEnabled = hasChecks()
  checker.checked = checksEnabled;
  tray?.setImage(checksEnabled ? notificationIcon : disabledNotificationIcon);

  console.log('checker updated');
}


async function restartProcess() {
  console.log('restarting', processFullPath)
  try {
    const { stdout } = await execAsync(`"${processFullPath}"`);
    console.log(`Restarted process stdout:`, stdout);
  } catch (err) {
    console.error(`Could not restart ${processName}: ${err}`);
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
      console.log('stopped process checks');
    }
    return true;
  }
  return false;
}

async function startProcessChecks() {
  try {
    stopProcessChecks(true);
    console.log('process checks started');
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      console.log(`${processName} is not running`);
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
        console.log('click', event);
        restartProcess().then();
      });
      restartNotification.on('close', (event) => {
        console.log('close', event);
        stopProcessChecks();
        updateCheckerTray();
      });
      restartNotification.show();
    } else {
      console.log(`${processName} is running`);
    }
  } catch (err) {
    console.error(`Could not check process status: ${err}`);
  }
  lastTimeout = setTimeout(startProcessChecks, defaultTimeout);
}

function notificationStart() {
  const notification = new Notification({
    ...notificationObject,
    body: 'Notifier started',
    silent: true,
  });
  notification.show();
}

app.whenReady().then(() => {
  app.setAppUserModelId(title);
  // createWindow();
  createTray();
  notificationStart();
  startProcessChecks().then();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // if (mainWindow === null) {
  //   createWindow();
  // }
});
