import { app, BrowserWindow, Tray, Menu, Notification } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { join, basename } from 'path';
import { promisify } from 'util';
import findProcess from 'find-process';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | null;
let tray: Tray | null;
let processFullPath = process.env.WORKSMART_PROCESS_PATH;
let defaultTimeout = 5000;

function getPath(filePath:string) {
    return join(process.pkg ? process.pkg.defaultEntrypoint : __dirname, filePath);
}

let iconPath = getPath('../images/toast_64.ico');


console.log('Icon path:', iconPath);

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
    width: 800,
    height: 600,
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
      label: 'Show Notification', 
      click: () => {
        let notification = new Notification({
          title: 'WorkSmart Notifier',
          body: `${processName} is not running`,
        //   icon: iconPath,
        //   actions: ['Restart', 'Stop checking']
        });
        notification.show();
      } 
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

async function checkProcess() {
  try {
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      console.log(`${processName} is not running`);
      const notification = new Notification({
        title: 'WorkSmart Notifier',
        body: `${processName} is not running`,
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
        if (index === 0) {
          restartProcess();
        } else if (index === 1) {
          console.log('Stop checking clicked');
          if(lastTimeout) {
            clearTimeout(lastTimeout);
          }
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
        title: 'WorkSmart Notifier',
        body: 'Notifier started'
      });
      notification.show();
}

app.whenReady().then(createWindow).then(createTray).then(notificationStart).then(checkProcess);

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
