import { contextBridge, ipcRenderer } from 'electron'

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('api', {
  // 设置
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: any) => ipcRenderer.invoke('settings:set', settings)
  },

  // 题材管理
  genres: {
    list: () => ipcRenderer.invoke('genres:list'),
    add: (genre: any) => ipcRenderer.invoke('genres:add', genre),
    update: (id: string, data: any) => ipcRenderer.invoke('genres:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('genres:delete', id)
  },

  // 书籍管理
  books: {
    list: () => ipcRenderer.invoke('books:list'),
    create: (book: any) => ipcRenderer.invoke('books:create', book),
    get: (title: string) => ipcRenderer.invoke('books:get', title),
    update: (title: string, data: any) => ipcRenderer.invoke('books:update', title, data),
    delete: (title: string) => ipcRenderer.invoke('books:delete', title),
    setCurrent: (title: string) => ipcRenderer.invoke('books:setCurrent', title),
    getCurrent: () => ipcRenderer.invoke('books:getCurrent'),
    openFolder: (title: string) => ipcRenderer.invoke('books:openFolder', title),
    getPath: (title: string) => ipcRenderer.invoke('books:getPath', title)
  },

  // 书籍文件操作
  bookFile: {
    read: (title: string, filePath: string) => ipcRenderer.invoke('book:readFile', title, filePath),
    write: (title: string, filePath: string, content: string) => ipcRenderer.invoke('book:writeFile', title, filePath, content)
  },

  // AI调用
  ai: {
    chat: (params: { systemPrompt: string; userPrompt: string }) =>
      ipcRenderer.invoke('ai:chat', params)
  },

  // 文件操作
  file: {
    open: () => ipcRenderer.invoke('dialog:openFile'),
    save: (params: { filename: string; content: string }) =>
      ipcRenderer.invoke('file:save', params)
  }
})
