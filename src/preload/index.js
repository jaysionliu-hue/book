"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    // Books
    books: {
        list: () => electron_1.ipcRenderer.invoke('db:books:list'),
        create: (book) => electron_1.ipcRenderer.invoke('db:books:create', book),
        get: (id) => electron_1.ipcRenderer.invoke('db:books:get', id),
        update: (id, updates) => electron_1.ipcRenderer.invoke('db:books:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('db:books:delete', id),
    },
    // Characters
    characters: {
        list: (bookId) => electron_1.ipcRenderer.invoke('db:characters:list', bookId),
        create: (character) => electron_1.ipcRenderer.invoke('db:characters:create', character),
        update: (id, data) => electron_1.ipcRenderer.invoke('db:characters:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('db:characters:delete', id),
    },
    // Settings
    settings: {
        list: (bookId) => electron_1.ipcRenderer.invoke('db:settings:list', bookId),
        create: (setting) => electron_1.ipcRenderer.invoke('db:settings:create', setting),
        update: (id, content) => electron_1.ipcRenderer.invoke('db:settings:update', id, content),
        delete: (id) => electron_1.ipcRenderer.invoke('db:settings:delete', id),
    },
    // Chapters
    chapters: {
        list: (bookId) => electron_1.ipcRenderer.invoke('db:chapters:list', bookId),
        create: (chapter) => electron_1.ipcRenderer.invoke('db:chapters:create', chapter),
        update: (id, updates) => electron_1.ipcRenderer.invoke('db:chapters:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('db:chapters:delete', id),
    },
    // Plot
    plot: {
        get: (bookId) => electron_1.ipcRenderer.invoke('db:plot:get', bookId),
        save: (bookId, data) => electron_1.ipcRenderer.invoke('db:plot:save', bookId, data),
    },
    // Style Profile
    style: {
        get: (bookId) => electron_1.ipcRenderer.invoke('db:style:get', bookId),
        save: (bookId, data) => electron_1.ipcRenderer.invoke('db:style:save', bookId, data),
    },
};
electron_1.contextBridge.exposeInMainWorld('api', api);
