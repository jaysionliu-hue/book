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

// 获取书籍目录（使用书名作为文件夹名）
function getBookDir(bookTitle: string) {
  // 规范化文件夹名称（去除特殊字符）
  const safeName = bookTitle.replace(/[<>:"/\\|?*]/g, '_')
  return path.join(getNovelsDir(), safeName)
}

// 初始化书籍文件夹结构
function initBookFolder(bookTitle: string, bookData: any) {
  const bookDir = getBookDir(bookTitle)
  
  // 创建文件夹
  const folders = ['chapters', 'objects', 'outline', 'roles', 'rules']
  folders.forEach(folder => {
    const folderPath = path.join(bookDir, folder)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
  })
  
  // 创建.feelfish配置目录
  const configDir = path.join(bookDir, '.feelfish')
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
  
  // 创建书籍配置
  const configPath = path.join(bookDir, 'feelfish.json')
  const config = {
    title: bookData.title,
    genreId: bookData.genreId,
    genreName: bookData.genreName,
    channel: bookData.channel,
    tags: bookData.tags,
    synopsis: bookData.synopsis,
    createdAt: bookData.createdAt,
    updatedAt: bookData.updatedAt
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  
  // 保存初始数据文件
  saveBookFile(bookTitle, 'objects/worldview.md', bookData.settings?.worldView || '')
  saveBookFile(bookTitle, 'outline/main.md', '')
  saveBookFile(bookTitle, 'roles/list.md', '')
  saveBookFile(bookTitle, 'rules/writing.md', JSON.stringify(bookData.writingRules || {}, null, 2))
  saveBookFile(bookTitle, 'core-setting.json', JSON.stringify(bookData.coreSetting || {}, null, 2))
  saveBookFile(bookTitle, 'story-structure.json', JSON.stringify(bookData.storyStructure || {}, null, 2))
  saveBookFile(bookTitle, 'characters.json', JSON.stringify(bookData.characters || [], null, 2))
  saveBookFile(bookTitle, 'chapters/index.json', JSON.stringify([], null, 2))
  
  return bookDir
}

// 保存书籍文件
function saveBookFile(bookTitle: string, filePath: string, content: string) {
  const bookDir = getBookDir(bookTitle)
  const fullPath = path.join(bookDir, filePath)
  const dir = path.dirname(fullPath)
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8')
}

// 读取书籍文件
function readBookFile(bookTitle: string, filePath: string): string {
  const fullPath = path.join(getBookDir(bookTitle), filePath)
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf-8')
  }
  return ''
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
    currentBookTitle: null
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

// 获取所有书籍（读取索引）
function getBooksIndex() {
  const novelsDir = getNovelsDir()
  const books: any[] = []
  
  if (!fs.existsSync(novelsDir)) return books
  
  const entries = fs.readdirSync(novelsDir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const configPath = path.join(novelsDir, entry.name, 'feelfish.json')
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
          books.push(config)
        } catch (e) {
          // 忽略无效配置
        }
      }
    }
  }
  
  return books
}

// 读取完整书籍数据
function readFullBook(bookTitle: string): any {
  const bookDir = getBookDir(bookTitle)
  if (!fs.existsSync(bookDir)) return null
  
  return {
    title: bookTitle,
    coreSetting: JSON.parse(readBookFile(bookTitle, 'core-setting.json') || '{}'),
    settings: {
      worldView: readBookFile(bookTitle, 'objects/worldview.md'),
      factions: [],
      rules: [],
      geography: [],
      props: [],
      timeline: []
    },
    characters: JSON.parse(readBookFile(bookTitle, 'characters.json') || '[]'),
    storyStructure: JSON.parse(readBookFile(bookTitle, 'story-structure.json') || '{"act1":"","act2":"","act3":"","chapters":[]}'),
    writingRules: JSON.parse(readBookFile(bookTitle, 'rules/writing.md') || '{}'),
    plotPoints: [],
    chapters: JSON.parse(readBookFile(bookTitle, 'chapters/index.json') || '[]'),
    currentChapter: 1,
    totalWordCount: calculateTotalWords(bookTitle)
  }
}

// 计算总字数
function calculateTotalWords(bookTitle: string): number {
  const chaptersIndex = JSON.parse(readBookFile(bookTitle, 'chapters/index.json') || '[]')
  return chaptersIndex.reduce((sum: number, ch: any) => sum + (ch.wordCount || 0), 0)
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
  return getBooksIndex()
})

ipcMain.handle('books:create', (_, book) => {
  const bookDir = initBookFolder(book.title, book)
  store.set('currentBookTitle', book.title)
  console.log('[Books] 创建书籍:', book.title, '目录:', bookDir)
  return book
})

ipcMain.handle('books:get', (_, title) => {
  return readFullBook(title)
})

ipcMain.handle('books:getByTitle', (_, title) => {
  return readFullBook(title)
})

ipcMain.handle('books:update', (_, title, data) => {
  const bookDir = getBookDir(title)
  if (!fs.existsSync(bookDir)) return null
  
  // 根据数据类型保存到对应文件
  if (data.coreSetting) {
    saveBookFile(title, 'core-setting.json', JSON.stringify(data.coreSetting, null, 2))
  }
  if (data.settings?.worldView !== undefined) {
    saveBookFile(title, 'objects/worldview.md', data.settings.worldView)
  }
  if (data.characters) {
    saveBookFile(title, 'characters.json', JSON.stringify(data.characters, null, 2))
  }
  if (data.storyStructure) {
    saveBookFile(title, 'story-structure.json', JSON.stringify(data.storyStructure, null, 2))
  }
  if (data.writingRules) {
    saveBookFile(title, 'rules/writing.md', JSON.stringify(data.writingRules, null, 2))
  }
  if (data.chapters) {
    saveBookFile(title, 'chapters/index.json', JSON.stringify(data.chapters, null, 2))
  }
  
  // 更新配置
  const configPath = path.join(bookDir, 'feelfish.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    config.updatedAt = Date.now()
    if (data.totalWordCount !== undefined) {
      config.totalWordCount = data.totalWordCount
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  }
  
  return readFullBook(title)
})

ipcMain.handle('books:delete', (_, title) => {
  const bookDir = getBookDir(title)
  if (fs.existsSync(bookDir)) {
    fs.rmSync(bookDir, { recursive: true, force: true })
  }
  
  if (store.get('currentBookTitle') === title) {
    store.set('currentBookTitle', null)
  }
  
  return true
})

ipcMain.handle('books:setCurrent', (_, title) => {
  store.set('currentBookTitle', title)
  return true
})

ipcMain.handle('books:getCurrent', () => {
  const currentTitle = store.get('currentBookTitle')
  if (!currentTitle) return null
  return readFullBook(currentTitle)
})

ipcMain.handle('books:openFolder', (_, title) => {
  const bookDir = getBookDir(title)
  if (fs.existsSync(bookDir)) {
    require('electron').shell.openPath(bookDir)
  }
  return bookDir
})

ipcMain.handle('books:getPath', (_, title) => {
  return getBookDir(title)
})

// 读写书籍内的文件
ipcMain.handle('book:readFile', (_, title, filePath) => {
  return readBookFile(title, filePath)
})

ipcMain.handle('book:writeFile', (_, title, filePath, content) => {
  saveBookFile(title, filePath, content)
  return true
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
