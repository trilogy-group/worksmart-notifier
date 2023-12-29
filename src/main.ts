import { app, BrowserWindow, Tray, Menu, Notification } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null;
let tray: Tray | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile('index.html'); // Load your HTML file here

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'tray-icon.png')); // Path to your tray icon
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Notification', 
      click: () => {
        let notification = new Notification({
          title: 'Test Notification',
          body: 'This is a test notification.'
        });
        notification.show();
      } 
    },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('Electron Tray App');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(createWindow).then(createTray);

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
