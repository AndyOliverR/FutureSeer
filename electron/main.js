'use strict';

const path = require('path');
const { app, BrowserWindow } = require('electron');

const APP_URL = process.env.ELECTRON_APP_URL || 'http://localhost:3000';
const shouldDisableSandbox = process.env.ELECTRON_NO_SANDBOX === '1';
const autoExitMs = Number(process.env.ELECTRON_EXIT_AFTER_MS || '0');

if (shouldDisableSandbox) {
  // Required for some Linux CI runners that execute as root.
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.on('closed', () => {
    // Allow GC
  });
}

app.whenReady().then(createWindow);

if (autoExitMs > 0) {
  app.whenReady().then(() => {
    setTimeout(() => {
      app.quit();
    }, autoExitMs);
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
