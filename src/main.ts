import { app, BrowserWindow, Tray, Menu, Notification, nativeImage, NotificationConstructorOptions } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { join, basename, resolve } from 'path';
import { promisify } from 'util';
import findProcess from 'find-process';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | null;
let tray: Tray | null;
let processFullPath = process.env.WORKSMART_PROCESS_PATH;
let defaultTimeout = 15_000;
const title = 'WorkSmart Notifier' as const;

function getPath(filePath:string) {
    return resolve(join(process.pkg ? process.pkg.defaultEntrypoint : __dirname, filePath));
}

let iconPath = nativeImage.createFromPath(getPath('../images/toast_64.ico'));
let notificationIconPath = nativeImage.createFromPath(getPath('../images/toast.png'));

const notificationObject: Pick<NotificationConstructorOptions, 'title' | 'icon'> = {
    title,
    icon: notificationIconPath,
}

let execAsync = promisify(exec);

if (!processFullPath) {
  switch(os.platform()) {
    case 'win32':
      processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';
      break;
    case 'linux':
      processFullPath = '/usr/bin/crossover';
      break;
    case 'darwin':
      processFullPath = '/Applications/Crossover.app';
      break;
    default:
      throw new Error('Unsupported platform, please use WORKSMART_PROCESS_PATH to define path to the application.');
  }
}

let processName = basename(processFullPath);

function createWindow() {
  mainWindow = new BrowserWindow({
    title,
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile(getPath('../public/index.html')); // Load your HTML file here

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(iconPath); // Path to your tray icon
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Run Checker', 
      click: () => checkProcess(),
    },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('Electron Tray App');
  tray.setContextMenu(contextMenu);
}

async function restartProcess() {
  try {
    const { stdout } = await execAsync(`"${processFullPath}"`);
    console.log(`Restarted process stdout:`, stdout);
  } catch (err) {
    console.error(`Could not restart ${processName}: ${err}`);
  }
}

let lastTimeout: NodeJS.Timeout | undefined;

function clearLocalTimeout() {
    if(lastTimeout) {
        clearTimeout(lastTimeout);
    }
}

async function checkProcess() {
  try {
    clearLocalTimeout();
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      console.log(`${processName} is not running`);
      const notification = new Notification({
        ...notificationObject,
        body: `${processName} is not running`,
        urgency: 'critical',
        actions: [
          {
            type: 'button',
            text: 'Restart',
          },
          {
            type: 'button',
            text: 'Stop checking',
          }
        ]
      });
      notification.on('action', (event, index) => {
        console.log(event, index);
        if (index === 0) {
          restartProcess();
        } else if (index === 1) {
          console.log('Stop checking clicked');
          clearLocalTimeout()
        }
      });
      notification.show();
    } else {
      console.log(`${processName} is running`);
    }
  } catch (err) {
    console.error(`Could not check process status: ${err}`);
  }
  lastTimeout = setTimeout(checkProcess, defaultTimeout);
}

function notificationStart(){
    const notification = new Notification({
        ...notificationObject,
        body: 'Notifier started',
      });
      notification.show();
}

app.whenReady().then(() => {
    app.setAppUserModelId(title);
    createWindow();
    createTray();
    notificationStart();
    checkProcess();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
