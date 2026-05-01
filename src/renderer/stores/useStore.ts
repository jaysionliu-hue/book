import { create } from 'zustand'

declare global {
  interface Window {
    api: {
      books: {
        list: () => Promise<any[]>
        create: (book: any) => Promise<any>
        get: (id: string) => Promise<any>
        update: (id: string, updates: any) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
      }
      characters: {
        list: (bookId: string) => Promise<any[]>
        create: (character: any) => Promise<any>
        update: (id: string, data: any) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
      }
      settings: {
        list: (bookId: string) => Promise<any[]>
        create: (setting: any) => Promise<any>
        update: (id: string, content: string) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
      }
      chapters: {
        list: (bookId: string) => Promise<any[]>
        create: (chapter: any) => Promise<any>
        update: (id: string, updates: any) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
      }
      plot: {
        get: (bookId: string) => Promise<any>
        save: (bookId: string, data: any) => Promise<boolean>
      }
      style: {
        get: (bookId: string) => Promise<any>
        save: (bookId: string, data: any) => Promise<boolean>
      }
    }
  }
}

interface Book {
  id: string
  name: string
  channel: string
  genre: string
  tags: string[]
  summary: string
  created_at: number
  updated_at: number
}

interface Character {
  id: string
  book_id: string
  name: string
  category: string
  data: any
  created_at: number
  updated_at: number
}

interface Chapter {
  id: string
  book_id: string
  title: string
  content: string
  chapter_order: number
  status: string
  created_at: number
  updated_at: number
}

interface PlotData {
  mainPlot: { node: string; chapter: number; status: string }[]
  subPlot: { node: string; chapter: number; status: string }[]
  foreshadow: { foreshadow: string; setChapter: number; status: string }[]
  completedForeshadow: any[]
}

interface StyleProfile {
  samples: string[]
  profile: {
    avgSentenceLength: number
    shortSentenceRatio: number
    connectors: string[]
    particles: string[]
  }
}

interface Store {
  books: Book[]
  currentBook: Book | null
  characters: Character[]
  chapters: Chapter[]
  plot: PlotData
  styleProfile: StyleProfile
  activeTab: string
  wordCountTarget: [number, number]
  
  loadBooks: () => Promise<void>
  setCurrentBook: (book: Book | null) => void
  createBook: (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  
  loadCharacters: () => Promise<void>
  createCharacter: (character: Omit<Character, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCharacter: (id: string, data: any) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  
  loadChapters: () => Promise<void>
  createChapter: (chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateChapter: (id: string, updates: any) => Promise<void>
  deleteChapter: (id: string) => Promise<void>
  
  loadPlot: () => Promise<void>
  savePlot: (data: PlotData) => Promise<void>
  
  loadStyleProfile: () => Promise<void>
  saveStyleProfile: (data: StyleProfile) => Promise<void>
  addStyleSample: (sample: string) => Promise<void>
  
  setActiveTab: (tab: string) => void
  setWordCountTarget: (target: [number, number]) => void
}

export const useStore = create<Store>((set, get) => ({
  books: [],
  currentBook: null,
  characters: [],
  chapters: [],
  plot: { mainPlot: [], subPlot: [], foreshadow: [], completedForeshadow: [] },
  styleProfile: { samples: [], profile: { avgSentenceLength: 0, shortSentenceRatio: 0, connectors: [], particles: [] } },
  activeTab: 'overview',
  wordCountTarget: [2500, 3000],
  
  loadBooks: async () => {
    const books = await window.api.books.list()
    set({ books })
  },
  
  setCurrentBook: (book) => {
    set({ currentBook: book })
    if (book) {
      get().loadCharacters()
      get().loadChapters()
      get().loadPlot()
      get().loadStyleProfile()
    } else {
      set({ characters: [], chapters: [], plot: { mainPlot: [], subPlot: [], foreshadow: [], completedForeshadow: [] }, styleProfile: { samples: [], profile: { avgSentenceLength: 0, shortSentenceRatio: 0, connectors: [], particles: [] } } })
    }
  },
  
  createBook: async (bookData) => {
    const now = Date.now()
    const book = {
      ...bookData,
      id: `book_${now}`,
      created_at: now,
      updated_at: now
    }
    await window.api.books.create(book)
    await get().loadBooks()
    set({ currentBook: book })
  },
  
  deleteBook: async (id) => {
    await window.api.books.delete(id)
    if (get().currentBook?.id === id) {
      set({ currentBook: null })
    }
    await get().loadBooks()
  },
  
  loadCharacters: async () => {
    const book = get().currentBook
    if (!book) return
    const characters = await window.api.characters.list(book.id)
    set({ characters })
  },
  
  createCharacter: async (characterData) => {
    const now = Date.now()
    const character = {
      ...characterData,
      id: `char_${now}`,
      created_at: now,
      updated_at: now
    }
    await window.api.characters.create(character)
    await get().loadCharacters()
  },
  
  updateCharacter: async (id, data) => {
    await window.api.characters.update(id, data)
    await get().loadCharacters()
  },
  
  deleteCharacter: async (id) => {
    await window.api.characters.delete(id)
    await get().loadCharacters()
  },
  
  loadChapters: async () => {
    const book = get().currentBook
    if (!book) return
    const chapters = await window.api.chapters.list(book.id)
    set({ chapters })
  },
  
  createChapter: async (chapterData) => {
    const now = Date.now()
    const chapter = {
      ...chapterData,
      id: `chapter_${now}`,
      created_at: now,
      updated_at: now
    }
    await window.api.chapters.create(chapter)
    await get().loadChapters()
  },
  
  updateChapter: async (id, updates) => {
    await window.api.chapters.update(id, { ...updates, updated_at: Date.now() })
    await get().loadChapters()
  },
  
  deleteChapter: async (id) => {
    await window.api.chapters.delete(id)
    await get().loadChapters()
  },
  
  loadPlot: async () => {
    const book = get().currentBook
    if (!book) return
    const plot = await window.api.plot.get(book.id)
    if (plot && plot.data) {
      set({ plot: JSON.parse(plot.data) })
    } else {
      set({ plot: { mainPlot: [], subPlot: [], foreshadow: [], completedForeshadow: [] } })
    }
  },
  
  savePlot: async (data) => {
    const book = get().currentBook
    if (!book) return
    await window.api.plot.save(book.id, data)
    set({ plot: data })
  },
  
  loadStyleProfile: async () => {
    const book = get().currentBook
    if (!book) return
    const style = await window.api.style.get(book.id)
    if (style && style.data) {
      set({ styleProfile: JSON.parse(style.data) })
    } else {
      set({ styleProfile: { samples: [], profile: { avgSentenceLength: 0, shortSentenceRatio: 0, connectors: [], particles: [] } } })
    }
  },
  
  saveStyleProfile: async (data) => {
    const book = get().currentBook
    if (!book) return
    await window.api.style.save(book.id, data)
    set({ styleProfile: data })
  },
  
  addStyleSample: async (sample) => {
    const profile = get().styleProfile
    const newSamples = [...profile.samples, sample]
    // Simple analysis
    const analysis = analyzeText(sample)
    const newProfile = {
      samples: newSamples,
      profile: analysis
    }
    await get().saveStyleProfile(newProfile)
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setWordCountTarget: (target) => set({ wordCountTarget: target })
}))

function analyzeText(text: string): StyleProfile['profile'] {
  const sentences = text.split(/[。！？\n]/).filter(s => s.trim())
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / (sentences.length || 1)
  const shortCount = sentences.filter(s => s.length <= 10).length
  const shortRatio = shortCount / (sentences.length || 1)
  
  const connectors = ['但是', '然而', '于是', '接着', '不过', '因为', '所以'].filter(w => text.includes(w))
  const particles = ['啊', '呢', '吧', '呀', '嘛', '哦', '哈'].filter(w => text.includes(w))
  
  return {
    avgSentenceLength: Math.round(avgLength),
    shortSentenceRatio: Math.round(shortRatio * 100) / 100,
    connectors,
    particles
  }
}
