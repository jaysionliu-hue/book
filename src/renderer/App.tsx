import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CreateBookModal from './components/CreateBookModal';
import Overview from './components/pages/Overview';
import Chapters from './components/pages/Chapters';
import Characters from './components/pages/Characters';
import SettingsPage from './components/pages/Settings';
import Genres from './components/pages/Genres';
import WritingAssistant from './components/pages/WritingAssistant';
import PlotControl from './components/pages/PlotControl';
import StyleLearn from './components/pages/StyleLearn';
import { Book, Settings, Genre } from './utils/types';

type Page = 'overview' | 'chapters' | 'characters' | 'settings' | 'genres' | 'assistant' | 'plot' | 'style';

declare global {
  interface Window {
    api: {
      settings: {
        get: () => Promise<Settings>;
        set: (settings: Settings) => Promise<boolean>;
      };
      genres: {
        list: () => Promise<Genre[]>;
        add: (genre: Genre) => Promise<boolean>;
        update: (id: string, data: Partial<Genre>) => Promise<boolean>;
        delete: (id: string) => Promise<boolean>;
      };
      books: {
        list: () => Promise<any[]>;
        create: (book: any) => Promise<any>;
        get: (title: string) => Promise<Book | null>;
        update: (title: string, data: Partial<Book>) => Promise<Book>;
        delete: (title: string) => Promise<boolean>;
        setCurrent: (title: string) => Promise<boolean>;
        getCurrent: () => Promise<Book | null>;
        openFolder: (title: string) => Promise<string>;
        getPath: (title: string) => Promise<string>;
      };
      bookFile: {
        read: (title: string, filePath: string) => Promise<string>;
        write: (title: string, filePath: string, content: string) => Promise<boolean>;
      };
      ai: {
        chat: (params: { systemPrompt: string; userPrompt: string }) => Promise<string>;
      };
      file: {
        open: () => Promise<string | null>;
        save: (params: { filename: string; content: string }) => Promise<boolean>;
      };
    };
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    async function init() {
      try {
        const [booksData, current, settingsData] = await Promise.all([
          window.api.books.list(),
          window.api.books.getCurrent(),
          window.api.settings.get()
        ]);
        setBooks(booksData || []);
        setCurrentBook(current);
        setSettings(settingsData);
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 创建新书
  const handleCreateBook = useCallback(async (book: Book) => {
    try {
      const newBook = await window.api.books.create(book);
      setBooks(prev => [...prev, { title: newBook.title, ...newBook }]);
      // 重新加载完整书籍数据
      const fullBook = await window.api.books.get(newBook.title);
      setCurrentBook(fullBook);
      setShowCreateModal(false);
      setCurrentPage('overview');
    } catch (error) {
      console.error('创建书籍失败:', error);
      alert('创建失败，请重试');
    }
  }, []);

  // 更新书籍
  const handleUpdateBook = useCallback(async (data: Partial<Book>) => {
    if (!currentBook?.title) return;
    try {
      const updated = await window.api.books.update(currentBook.title, data);
      setCurrentBook(updated);
      // 更新书籍列表
      setBooks(prev => prev.map(b => b.title === currentBook.title ? { ...b, ...updated } : b));
    } catch (error) {
      console.error('更新书籍失败:', error);
    }
  }, [currentBook]);

  // 切换书籍
  const handleSwitchBook = useCallback(async (book: any) => {
    const fullBook = await window.api.books.get(book.title);
    await window.api.books.setCurrent(book.title);
    setCurrentBook(fullBook);
    setCurrentPage('overview');
  }, []);

  // 删除书籍
  const handleDeleteBook = useCallback(async (bookTitle: string) => {
    if (!confirm('确定删除这本书吗？')) return;
    try {
      await window.api.books.delete(bookTitle);
      setBooks(prev => prev.filter(b => b.title !== bookTitle));
      if (currentBook?.title === bookTitle) {
        setCurrentBook(null);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  }, [currentBook]);

  // 渲染当前页面
  const renderPage = () => {
    // settings和genres页面不需要书籍也能访问
    if (!currentBook && currentPage !== 'settings' && currentPage !== 'genres') {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl">请先创建或选择一本书</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              创建新书
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'overview':
        return <Overview book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
      case 'chapters':
        return <Chapters book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
      case 'characters':
        return <Characters book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
      case 'settings':
        return <SettingsPage onSave={setSettings} />;
      case 'genres':
        return <Genres />;
      case 'assistant':
        return <WritingAssistant book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
      case 'plot':
        return <PlotControl book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
      case 'style':
        return <StyleLearn book={currentBook!} onUpdate={handleUpdateBook} />;
      default:
        return <Overview book={currentBook!} onUpdate={handleUpdateBook} settings={settings} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900 text-gray-100">
      {/* 侧边栏 */}
      <Sidebar
        books={books}
        currentBook={currentBook}
        currentPage={currentPage}
        onSwitchPage={setCurrentPage}
        onCreateBook={() => setShowCreateModal(true)}
        onSwitchBook={handleSwitchBook}
        onDeleteBook={handleDeleteBook}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 drag-region">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold no-drag">
              {currentBook ? `《${currentBook.title}》` : '网文创作工作室'}
            </h1>
            {currentBook && (
              <span className="text-sm text-gray-400 no-drag">
                {currentBook.channel === 'female' ? '女频' : '男频'} · {currentBook.genreName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 no-drag">
            <span className="text-sm text-gray-400">
              {currentBook ? `第${currentBook.currentChapter || 1}章` : ''}
            </span>
            <span className="text-sm text-gray-400">
              {currentBook ? `${(currentBook.totalWordCount || 0).toLocaleString()}字` : ''}
            </span>
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>

        {/* 底部状态栏 */}
        <footer className="h-8 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-gray-400">
          <span>{currentPage}</span>
          <span>字数管控：{currentBook ? `${(currentBook.totalWordCount || 0).toLocaleString()}` : '0'} 字</span>
        </footer>
      </div>

      {/* 创建新书弹窗 */}
      {showCreateModal && (
        <CreateBookModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBook}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;
