import Store from 'electron-store';

// 定义数据结构
interface Book {
  id: string;
  title: string;
  channel: 'male' | 'female';
  genre: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  wordCount: number;
  status: 'draft' | 'completed';
  createdAt: number;
  updatedAt: number;
}

interface Character {
  id: string;
  bookId: string;
  name: string;
  type: 'protagonist' | 'supporting' | 'antagonist';
  appearance: string;
  personality: string;
  background: string;
  desires: string;
  weakness: string;
  contradictions: string;
  relationships: string;
  secrets: string;
  growth: string;
  currentState: string;
}

interface Plot {
  id: string;
  bookId: string;
  type: 'main' | 'sub' | 'foreshadow';
  title: string;
  description: string;
  status: 'pending' | 'active' | 'resolved';
}

interface WorldSetting {
  id: string;
  bookId: string;
  category: 'world' | 'factions' | 'rules' | 'geography' | 'items' | 'timeline';
  title: string;
  content: string;
}

interface StyleSample {
  id: string;
  bookId: string;
  content: string;
  analysis: {
    avgSentenceLength: number;
    shortSentenceRatio: number;
    connectors: string[];
    exclamations: number;
    dialogueRatio: number;
    adjectives: string[];
    uniquePhrases: string[];
  };
}

interface StoreSchema {
  books: Book[];
  chapters: Chapter[];
  characters: Character[];
  plots: Plot[];
  worldSettings: WorldSetting[];
  styleSamples: StyleSample[];
  currentBookId: string | null;
  apiConfig: {
    provider: string;
    apiKey: string;
    endpoint: string;
    model: string;
  };
}

const store = new Store<StoreSchema>({
  name: 'webnovel-studio-data',
  defaults: {
    books: [],
    chapters: [],
    characters: [],
    plots: [],
    worldSettings: [],
    styleSamples: [],
    currentBookId: null,
    apiConfig: {
      provider: 'openai',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4'
    }
  }
});

export default store;

// 辅助函数
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export { store };
