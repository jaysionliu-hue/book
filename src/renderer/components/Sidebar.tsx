import React, { useState } from 'react';
import { Book } from '../utils/types';

type Page = 'overview' | 'chapters' | 'characters' | 'settings' | 'genres' | 'assistant' | 'plot' | 'style';

interface SidebarProps {
  books: Book[];
  currentBook: Book | null;
  currentPage: Page;
  onSwitchPage: (page: Page) => void;
  onCreateBook: () => void;
  onSwitchBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
}

const menuItems = [
  { id: 'overview', label: '总览', icon: '📊' },
  { id: 'chapters', label: '章节', icon: '📖' },
  { id: 'characters', label: '人物', icon: '👤' },
  { id: 'plot', label: '剧情', icon: '🎯' },
  { id: 'assistant', label: '写作助手', icon: '✨' },
  { id: 'style', label: '文风学习', icon: '🎨' },
  { id: 'settings', label: '设置', icon: '⚙️' },
];

export default function Sidebar({
  books,
  currentBook,
  currentPage,
  onSwitchPage,
  onCreateBook,
  onSwitchBook,
  onDeleteBook,
}: SidebarProps) {
  const [showBookList, setShowBookList] = useState(false);

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-lg font-bold text-blue-400">📚 网文创作工作室</h1>
      </div>

      {/* 作品选择 */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-xs text-gray-400 mb-2">当前作品</div>
        <button
          onClick={() => setShowBookList(!showBookList)}
          className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-left flex items-center justify-between transition"
        >
          <span className="truncate">
            {currentBook ? currentBook.title : '未选择作品'}
          </span>
          <span className="text-xs">▼</span>
        </button>

        {showBookList && (
          <div className="mt-2 bg-slate-700 rounded-lg overflow-hidden">
            {books.map((book) => (
              <div
                key={book.id}
                className={`p-2 cursor-pointer hover:bg-slate-600 flex items-center justify-between ${
                  currentBook?.id === book.id ? 'bg-blue-600' : ''
                }`}
                onClick={() => {
                  onSwitchBook(book);
                  setShowBookList(false);
                }}
              >
                <span className="truncate text-sm">{book.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBook(book.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs px-1"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                onCreateBook();
                setShowBookList(false);
              }}
              className="w-full p-2 text-blue-400 hover:bg-slate-600 text-sm text-center"
            >
              + 新建作品
            </button>
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSwitchPage(item.id as Page)}
            className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition mb-1 ${
              currentPage === item.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700 text-gray-300'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 底部 */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onCreateBook}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
        >
          + 新建作品
        </button>
      </div>
    </aside>
  );
}
