import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Books
  books: {
    list: () => ipcRenderer.invoke('db:books:list'),
    create: (book: any) => ipcRenderer.invoke('db:books:create', book),
    get: (id: string) => ipcRenderer.invoke('db:books:get', id),
    update: (id: string, updates: any) => ipcRenderer.invoke('db:books:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('db:books:delete', id),
  },
  
  // Characters
  characters: {
    list: (bookId: string) => ipcRenderer.invoke('db:characters:list', bookId),
    create: (character: any) => ipcRenderer.invoke('db:characters:create', character),
    update: (id: string, data: any) => ipcRenderer.invoke('db:characters:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:characters:delete', id),
  },
  
  // Settings
  settings: {
    list: (bookId: string) => ipcRenderer.invoke('db:settings:list', bookId),
    create: (setting: any) => ipcRenderer.invoke('db:settings:create', setting),
    update: (id: string, content: string) => ipcRenderer.invoke('db:settings:update', id, content),
    delete: (id: string) => ipcRenderer.invoke('db:settings:delete', id),
  },
  
  // Chapters
  chapters: {
    list: (bookId: string) => ipcRenderer.invoke('db:chapters:list', bookId),
    create: (chapter: any) => ipcRenderer.invoke('db:chapters:create', chapter),
    update: (id: string, updates: any) => ipcRenderer.invoke('db:chapters:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('db:chapters:delete', id),
  },
  
  // Plot
  plot: {
    get: (bookId: string) => ipcRenderer.invoke('db:plot:get', bookId),
    save: (bookId: string, data: any) => ipcRenderer.invoke('db:plot:save', bookId, data),
  },
  
  // Style Profile
  style: {
    get: (bookId: string) => ipcRenderer.invoke('db:style:get', bookId),
    save: (bookId: string, data: any) => ipcRenderer.invoke('db:style:save', bookId, data),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ApiType = typeof api;
