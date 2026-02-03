'use strict';

const { contextBridge } = require('electron');

// Minimal bridge so the renderer can detect Electron and add IPC later (e.g. for SQLite).
contextBridge.exposeInMainWorld('electron', {
  // Placeholder for future IPC (e.g. storageGet, storageSet when using SQLite in main process).
  isElectron: true,
});
