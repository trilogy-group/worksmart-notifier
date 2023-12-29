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

let iconPath = nativeImage.createFromPath(getPath('../images/toast_64.ico'));
let notificationIcon = nativeImage.createFromPath(getPath('../images/toast.png'));
let disabledNotificationIcon = nativeImage.createFromPath(getPath('../images/toast_disabled.png'));

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
      click: () => {
        if (hasChecks()) {
          stopProcessChecks();
          tray?.setImage(disabledNotificationIcon);
        } else {
          startProcessChecks();
          tray?.setImage(notificationIcon);
        }
      },
    },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
}

function rebuildCheckerTray() {
  console.log('rebuilding checker');
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
  checker.checked = hasChecks();
  tray?.setImage(checksEnabled ? notificationIcon : disabledNotificationIcon);

  console.log('checker rebuilt');
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

function stopProcessChecks() {
  if (lastTimeout) {
    console.log('stopping process checks');
    clearTimeout(lastTimeout);
    lastTimeout = undefined;
    return true;
  }
  return false;
}

async function startProcessChecks() {
  try {
    stopProcessChecks();
    console.log('process checks started');
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      console.log(`${processName} is not running`);
      restartNotification = new Notification({
        ...notificationObject,
        body: `${processName} is not running. Click to restart. Close to stop checks.`,
      });
      restartNotification.on('click', (event) => {
        console.log('click', event);
        restartProcess().then();
      });
      restartNotification.on('close', (event) => {
        console.log('close', event);
        stopProcessChecks();
        rebuildCheckerTray();
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
  startProcessChecks();
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
