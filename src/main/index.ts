import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import Store from 'electron-store'

// 初始化存储
const store = new Store({
  name: 'webnovel-studio-data',
  defaults: {
    settings: {
      apiKey: '',
      apiUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      maxTokens: 2000,
      temperature: 0.7
    },
    genres: [
      // 女频
      { id: 'female-urban', name: '现代都市', channel: 'female', category: 'urban' },
      { id: 'female-sweet', name: '现代甜宠', channel: 'female', category: 'urban' },
      { id: 'female-bitter', name: '现代虐恋', channel: 'female', category: 'urban' },
      { id: 'female-ceo', name: '豪门总裁', channel: 'female', category: 'urban' },
      { id: 'female-ancient', name: '古言', channel: 'female', category: 'ancient' },
      { id: 'female-palace', name: '宫斗', channel: 'female', category: 'ancient' },
      { id: 'female-xianxia', name: '仙侠', channel: 'female', category: 'fantasy' },
      { id: 'female-mystery', name: '悬疑', channel: 'female', category: 'suspense' },
      // 男频
      { id: 'male-urban', name: '都市', channel: 'male', category: 'urban' },
      { id: 'male-fantasy', name: '玄幻', channel: 'male', category: 'fantasy' },
      { id: 'male-xuanhuan', name: '玄幻奇幻', channel: 'male', category: 'fantasy' },
      { id: 'male-game', name: '游戏', channel: 'male', category: 'game' },
      { id: 'male-sci-fi', name: '科幻', channel: 'male', category: 'scifi' },
      { id: 'male-martial', name: '武侠', channel: 'male', category: 'martial' }
    ],
    books: [],
    currentBookId: null
  }
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a'
  })

  // 开发模式加载本地服务器
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ============ IPC 处理 ============

// 设置相关
ipcMain.handle('settings:get', () => store.get('settings'))
ipcMain.handle('settings:set', (_, settings) => {
  store.set('settings', settings)
  return true
})

// 题材相关
ipcMain.handle('genres:list', () => store.get('genres'))
ipcMain.handle('genres:add', (_, genre) => {
  const genres = store.get('genres') as any[]
  genres.push(genre)
  store.set('genres', genres)
  return true
})
ipcMain.handle('genres:update', (_, id, data) => {
  const genres = store.get('genres') as any[]
  const index = genres.findIndex((g: any) => g.id === id)
  if (index !== -1) {
    genres[index] = { ...genres[index], ...data }
    store.set('genres', genres)
  }
  return true
})
ipcMain.handle('genres:delete', (_, id) => {
  const genres = store.get('genres') as any[]
  store.set('genres', genres.filter((g: any) => g.id !== id))
  return true
})

// 书籍相关
ipcMain.handle('books:list', () => store.get('books'))
ipcMain.handle('books:create', (_, book) => {
  const books = store.get('books') as any[]
  books.push(book)
  store.set('books', books)
  store.set('currentBookId', book.id)
  return book
})
ipcMain.handle('books:get', (_, id) => {
  const books = store.get('books') as any[]
  return books.find((b: any) => b.id === id)
})
ipcMain.handle('books:update', (_, id, data) => {
  const books = store.get('books') as any[]
  const index = books.findIndex((b: any) => b.id === id)
  if (index !== -1) {
    books[index] = { ...books[index], ...data, updated_at: Date.now() }
    store.set('books', books)
  }
  return books[index]
})
ipcMain.handle('books:delete', (_, id) => {
  const books = store.get('books') as any[]
  store.set('books', books.filter((b: any) => b.id !== id))
  if (store.get('currentBookId') === id) {
    store.set('currentBookId', null)
  }
  return true
})
ipcMain.handle('books:setCurrent', (_, id) => {
  store.set('currentBookId', id)
  return true
})
ipcMain.handle('books:getCurrent', () => {
  const currentId = store.get('currentBookId')
  if (!currentId) return null
  const books = store.get('books') as any[]
  return books.find((b: any) => b.id === currentId)
})

// DeepSeek API 调用
ipcMain.handle('ai:chat', async (_, { systemPrompt, userPrompt }) => {
  const settings = store.get('settings') as any
  
  if (!settings.apiKey) {
    throw new Error('请先在设置中配置DeepSeek API Key')
  }

  try {
    const response = await fetch(`${settings.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: settings.maxTokens || 2000,
        temperature: settings.temperature || 0.7
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API调用失败: ${response.status} - ${error}`)
    }

    const data: any = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error: any) {
    throw new Error(error.message || 'AI调用失败')
  }
})

// 文件选择
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '文本文件', extensions: ['txt', 'md'] }
    ]
  })
  if (result.canceled) return null
  return fs.readFileSync(result.filePaths[0], 'utf-8')
})

// 保存文件
ipcMain.handle('file:save', async (_, { filename, content }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [
      { name: '文本文件', extensions: ['txt', 'md'] }
    ]
  })
  if (result.canceled || !result.filePath) return false
  fs.writeFileSync(result.filePath, content, 'utf-8')
  return true
})
