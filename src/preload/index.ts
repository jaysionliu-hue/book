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
    get: (id: string) => ipcRenderer.invoke('books:get', id),
    update: (id: string, data: any) => ipcRenderer.invoke('books:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('books:delete', id),
    setCurrent: (id: string) => ipcRenderer.invoke('books:setCurrent', id),
    getCurrent: () => ipcRenderer.invoke('books:getCurrent')
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
