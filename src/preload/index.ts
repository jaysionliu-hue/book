import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Books
  books: {
    list: () => ipcRenderer.invoke('book:getAll'),
    create: (book: any) => ipcRenderer.invoke('book:create', book),
    get: (id: string) => ipcRenderer.invoke('book:get', id),
    update: (id: string, updates: any) => ipcRenderer.invoke('book:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('book:delete', id),
  },
  
  // Characters
  characters: {
    list: (bookId: string) => ipcRenderer.invoke('character:getAll', bookId),
    create: (character: any) => ipcRenderer.invoke('character:create', character),
    update: (id: string, data: any) => ipcRenderer.invoke('character:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('character:delete', id),
  },
  
  // Chapters
  chapters: {
    list: (bookId: string) => ipcRenderer.invoke('chapter:getAll', bookId),
    create: (chapter: any) => ipcRenderer.invoke('chapter:create', chapter),
    update: (id: string, updates: any) => ipcRenderer.invoke('chapter:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('chapter:delete', id),
  },
  
  // Plots
  plot: {
    get: (bookId: string) => ipcRenderer.invoke('plot:getAll', bookId),
    create: (data: any) => ipcRenderer.invoke('plot:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('plot:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('plot:delete', id),
  },
  
  // World Settings
  settings: {
    list: (bookId: string) => ipcRenderer.invoke('worldSetting:getAll', bookId),
    create: (setting: any) => ipcRenderer.invoke('worldSetting:create', setting),
    update: (id: string, content: string) => ipcRenderer.invoke('worldSetting:update', id, content),
    delete: (id: string) => ipcRenderer.invoke('worldSetting:delete', id),
  },
  
  // Style Profile
  style: {
    list: (bookId: string) => ipcRenderer.invoke('styleSample:getAll', bookId),
    create: (data: any) => ipcRenderer.invoke('styleSample:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('styleSample:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('styleSample:delete', id),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ApiType = typeof api;
