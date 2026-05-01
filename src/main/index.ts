import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import Store from 'electron-store'

// 获取应用根目录
function getAppRoot() {
  if (app.isPackaged) {
    return path.dirname(app.getPath('exe'))
  }
  return process.cwd()
}

// 获取小说根目录
function getNovelsDir() {
  const novelsDir = path.join(getAppRoot(), 'novels')
  if (!fs.existsSync(novelsDir)) {
    fs.mkdirSync(novelsDir, { recursive: true })
  }
  return novelsDir
}

// 获取书籍目录
function getBookDir(bookId: string) {
  return path.join(getNovelsDir(), bookId)
}

// 初始化存储（仅用于设置和题材）
const store = new Store({
  name: 'webnovel-studio-settings',
  defaults: {
    settings: {
      apiKey: '',
      apiUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      maxTokens: 2000,
      temperature: 0.7
    },
    genres: [
      { id: 'female-urban', name: '现代都市', channel: 'female', category: 'urban' },
      { id: 'female-sweet', name: '现代甜宠', channel: 'female', category: 'urban' },
      { id: 'female-bitter', name: '现代虐恋', channel: 'female', category: 'urban' },
      { id: 'female-ceo', name: '豪门总裁', channel: 'female', category: 'urban' },
      { id: 'female-ancient', name: '古言', channel: 'female', category: 'ancient' },
      { id: 'female-palace', name: '宫斗', channel: 'female', category: 'ancient' },
      { id: 'female-xianxia', name: '仙侠', channel: 'female', category: 'fantasy' },
      { id: 'female-mystery', name: '悬疑', channel: 'female', category: 'suspense' },
      { id: 'male-urban', name: '都市', channel: 'male', category: 'urban' },
      { id: 'male-fantasy', name: '玄幻', channel: 'male', category: 'fantasy' },
      { id: 'male-xuanhuan', name: '玄幻奇幻', channel: 'male', category: 'fantasy' },
      { id: 'male-game', name: '游戏', channel: 'male', category: 'game' },
      { id: 'male-sci-fi', name: '科幻', channel: 'male', category: 'scifi' },
      { id: 'male-martial', name: '武侠', channel: 'male', category: 'martial' }
    ],
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

// ============ 书籍文件夹操作 ============

// 确保书籍目录存在
function ensureBookDir(bookId: string) {
  const bookDir = getBookDir(bookId)
  const chaptersDir = path.join(bookDir, 'chapters')
  const exportsDir = path.join(bookDir, 'exports')
  
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true })
  }
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true })
  }
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }
  
  return bookDir
}

// 读取书籍索引
function readBookIndex(): any[] {
  const indexPath = path.join(getNovelsDir(), '.index.json')
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
  }
  return []
}

// 保存书籍索引
function saveBookIndex(books: any[]) {
  const indexPath = path.join(getNovelsDir(), '.index.json')
  fs.writeFileSync(indexPath, JSON.stringify(books, null, 2), 'utf-8')
}

// 读取书籍数据
function readBook(bookId: string): any {
  const bookPath = path.join(getBookDir(bookId), 'book.json')
  if (fs.existsSync(bookPath)) {
    return JSON.parse(fs.readFileSync(bookPath, 'utf-8'))
  }
  return null
}

// 保存书籍数据
function saveBook(book: any) {
  const bookPath = path.join(getBookDir(book.id), 'book.json')
  fs.writeFileSync(bookPath, JSON.stringify(book, null, 2), 'utf-8')
}

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

// 书籍相关 - 使用独立文件夹
ipcMain.handle('books:list', () => {
  // 返回书籍索引（轻量信息）
  return readBookIndex().map(book => ({
    id: book.id,
    title: book.title,
    genreId: book.genreId,
    genreName: book.genreName,
    channel: book.channel,
    tags: book.tags,
    synopsis: book.synopsis,
    currentChapter: book.currentChapter,
    totalWordCount: book.totalWordCount,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt
  }))
})

ipcMain.handle('books:create', (_, book) => {
  // 创建书籍文件夹
  ensureBookDir(book.id)
  
  // 保存完整书籍数据
  saveBook(book)
  
  // 更新索引
  const index = readBookIndex()
  index.push({
    id: book.id,
    title: book.title,
    genreId: book.genreId,
    genreName: book.genreName,
    channel: book.channel,
    tags: book.tags,
    synopsis: book.synopsis,
    currentChapter: book.currentChapter,
    totalWordCount: book.totalWordCount,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt
  })
  saveBookIndex(index)
  
  // 记录当前书籍
  store.set('currentBookId', book.id)
  
  console.log('[Books] 创建书籍:', book.title, '目录:', getBookDir(book.id))
  return book
})

ipcMain.handle('books:get', (_, id) => {
  return readBook(id)
})

ipcMain.handle('books:update', (_, id, data) => {
  const book = readBook(id)
  if (book) {
    const updated = { ...book, ...data, updatedAt: Date.now() }
    saveBook(updated)
    
    // 更新索引
    const index = readBookIndex()
    const idx = index.findIndex(b => b.id === id)
    if (idx !== -1) {
      index[idx] = { ...index[idx], ...data, updatedAt: Date.now() }
      saveBookIndex(index)
    }
    
    return updated
  }
  return null
})

ipcMain.handle('books:delete', (_, id) => {
  // 删除书籍文件夹
  const bookDir = getBookDir(id)
  if (fs.existsSync(bookDir)) {
    fs.rmSync(bookDir, { recursive: true, force: true })
  }
  
  // 更新索引
  const index = readBookIndex().filter(b => b.id !== id)
  saveBookIndex(index)
  
  // 清除当前书籍
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
  return readBook(currentId)
})

ipcMain.handle('books:openFolder', (_, id) => {
  const bookDir = getBookDir(id)
  if (fs.existsSync(bookDir)) {
    require('electron').shell.openPath(bookDir)
  }
  return bookDir
})

ipcMain.handle('books:getPath', (_, id) => {
  return getBookDir(id)
})

// DeepSeek API 调用
ipcMain.handle('ai:chat', async (_, { systemPrompt, userPrompt }) => {
  const settings = store.get('settings') as any || {}
  
  console.log('[AI] 当前settings:', JSON.stringify(settings))
  
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    console.error('[AI] API Key为空')
    throw new Error('请先在设置中配置DeepSeek API Key')
  }

  try {
    const apiUrl = settings.apiUrl || 'https://api.deepseek.com'
    const model = settings.model || 'deepseek-chat'
    const maxTokens = settings.maxTokens || 2000
    const temperature = settings.temperature ?? 0.7
    
    console.log('[AI] 发送请求到:', apiUrl)
    
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API Error:', response.status, errorText)
      throw new Error(`API调用失败: ${response.status}`)
    }

    const data: any = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error: any) {
    console.error('AI调用错误:', error)
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
