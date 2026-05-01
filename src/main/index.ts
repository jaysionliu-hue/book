import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import store, { generateId } from './database';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: '网文创作工作室',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers - Books
ipcMain.handle('book:getAll', () => store.get('books'));
ipcMain.handle('book:get', (_, id: string) => {
  const books = store.get('books') as any[];
  return books.find(b => b.id === id);
});
ipcMain.handle('book:create', (_, data: any) => {
  const books = store.get('books') as any[];
  const newBook = { ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() };
  books.push(newBook);
  store.set('books', books);
  return newBook;
});
ipcMain.handle('book:update', (_, id: string, data: any) => {
  const books = store.get('books') as any[];
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...data, updatedAt: Date.now() };
    store.set('books', books);
    return books[index];
  }
  return null;
});
ipcMain.handle('book:delete', (_, id: string) => {
  const books = store.get('books') as any[];
  store.set('books', books.filter(b => b.id !== id));
  return true;
});
ipcMain.handle('book:setCurrent', (_, id: string | null) => {
  store.set('currentBookId', id);
  return true;
});
ipcMain.handle('book:getCurrent', () => store.get('currentBookId'));

// IPC Handlers - Chapters
ipcMain.handle('chapter:getAll', (_, bookId: string) => {
  const chapters = store.get('chapters') as any[];
  return chapters.filter(c => c.bookId === bookId);
});
ipcMain.handle('chapter:create', (_, data: any) => {
  const chapters = store.get('chapters') as any[];
  const newChapter = { ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() };
  chapters.push(newChapter);
  store.set('chapters', chapters);
  return newChapter;
});
ipcMain.handle('chapter:update', (_, id: string, data: any) => {
  const chapters = store.get('chapters') as any[];
  const index = chapters.findIndex(c => c.id === id);
  if (index !== -1) {
    chapters[index] = { ...chapters[index], ...data, updatedAt: Date.now() };
    store.set('chapters', chapters);
    return chapters[index];
  }
  return null;
});
ipcMain.handle('chapter:delete', (_, id: string) => {
  const chapters = store.get('chapters') as any[];
  store.set('chapters', chapters.filter(c => c.id !== id));
  return true;
});

// IPC Handlers - Characters
ipcMain.handle('character:getAll', (_, bookId: string) => {
  const characters = store.get('characters') as any[];
  return characters.filter(c => c.bookId === bookId);
});
ipcMain.handle('character:create', (_, data: any) => {
  const characters = store.get('characters') as any[];
  const newCharacter = { ...data, id: generateId() };
  characters.push(newCharacter);
  store.set('characters', characters);
  return newCharacter;
});
ipcMain.handle('character:update', (_, id: string, data: any) => {
  const characters = store.get('characters') as any[];
  const index = characters.findIndex(c => c.id === id);
  if (index !== -1) {
    characters[index] = { ...characters[index], ...data };
    store.set('characters', characters);
    return characters[index];
  }
  return null;
});
ipcMain.handle('character:delete', (_, id: string) => {
  const characters = store.get('characters') as any[];
  store.set('characters', characters.filter(c => c.id !== id));
  return true;
});

// IPC Handlers - Plots
ipcMain.handle('plot:getAll', (_, bookId: string) => {
  const plots = store.get('plots') as any[];
  return plots.filter(p => p.bookId === bookId);
});
ipcMain.handle('plot:create', (_, data: any) => {
  const plots = store.get('plots') as any[];
  const newPlot = { ...data, id: generateId() };
  plots.push(newPlot);
  store.set('plots', plots);
  return newPlot;
});
ipcMain.handle('plot:update', (_, id: string, data: any) => {
  const plots = store.get('plots') as any[];
  const index = plots.findIndex(p => p.id === id);
  if (index !== -1) {
    plots[index] = { ...plots[index], ...data };
    store.set('plots', plots);
    return plots[index];
  }
  return null;
});
ipcMain.handle('plot:delete', (_, id: string) => {
  const plots = store.get('plots') as any[];
  store.set('plots', plots.filter(p => p.id !== id));
  return true;
});

// IPC Handlers - World Settings
ipcMain.handle('world:getAll', (_, bookId: string) => {
  const settings = store.get('worldSettings') as any[];
  return settings.filter(s => s.bookId === bookId);
});
ipcMain.handle('world:create', (_, data: any) => {
  const settings = store.get('worldSettings') as any[];
  const newSetting = { ...data, id: generateId() };
  settings.push(newSetting);
  store.set('worldSettings', settings);
  return newSetting;
});
ipcMain.handle('world:update', (_, id: string, data: any) => {
  const settings = store.get('worldSettings') as any[];
  const index = settings.findIndex(s => s.id === id);
  if (index !== -1) {
    settings[index] = { ...settings[index], ...data };
    store.set('worldSettings', settings);
    return settings[index];
  }
  return null;
});
ipcMain.handle('world:delete', (_, id: string) => {
  const settings = store.get('worldSettings') as any[];
  store.set('worldSettings', settings.filter(s => s.id !== id));
  return true;
});

// IPC Handlers - Style Samples
ipcMain.handle('style:getAll', (_, bookId: string) => {
  const samples = store.get('styleSamples') as any[];
  return samples.filter(s => s.bookId === bookId);
});
ipcMain.handle('style:create', (_, data: any) => {
  const samples = store.get('styleSamples') as any[];
  const newSample = { ...data, id: generateId() };
  samples.push(newSample);
  store.set('styleSamples', samples);
  return newSample;
});
ipcMain.handle('style:delete', (_, id: string) => {
  const samples = store.get('styleSamples') as any[];
  store.set('styleSamples', samples.filter(s => s.id !== id));
  return true;
});

// IPC Handlers - API Config
ipcMain.handle('api:getConfig', () => store.get('apiConfig'));
ipcMain.handle('api:updateConfig', (_, config: any) => {
  store.set('apiConfig', config);
  return true;
});

app.whenReady().then(() => {
  createWindow();
});
