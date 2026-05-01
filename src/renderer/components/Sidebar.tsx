import { useStore } from '../stores/useStore'

interface SidebarProps {
  onCreateBook: () => void
}

const tabs = [
  { id: 'overview', icon: '📖', label: '总览' },
  { id: 'chapters', icon: '📝', label: '章节' },
  { id: 'characters', icon: '👤', label: '人物' },
  { id: 'settings', icon: '⚙️', label: '设定' },
  { id: 'plot', icon: '🗺️', label: '剧情' },
  { id: 'style', icon: '✍️', label: '文风' },
]

export default function Sidebar({ onCreateBook }: SidebarProps) {
  const { books, currentBook, setCurrentBook, activeTab, setActiveTab, chapters, wordCountTarget } = useStore()
  
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0)
  
  return (
    <div className="w-64 bg-sidebar text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span>📚</span> 网文创作工作室
        </h1>
      </div>
      
      {/* Book Selector */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">当前作品</span>
          <button 
            onClick={onCreateBook}
            className="text-xs bg-primary-600 hover:bg-primary-500 px-2 py-1 rounded transition-colors"
          >
            + 新建
          </button>
        </div>
        
        {currentBook ? (
          <div className="bg-sidebarHover p-3 rounded-lg">
            <div className="font-medium truncate">{currentBook.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {currentBook.channel} · {currentBook.genre}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">未选择作品</div>
        )}
        
        {/* Book List */}
        {books.length > 0 && (
          <div className="mt-3 space-y-1">
            {books.map(book => (
              <button
                key={book.id}
                onClick={() => setCurrentBook(book)}
                className={`w-full text-left text-sm p-2 rounded transition-colors ${
                  currentBook?.id === book.id ? 'bg-primary-600' : 'hover:bg-sidebarHover'
                }`}
              >
                <div className="truncate">{book.name}</div>
                <div className="text-xs text-gray-500">{book.channel}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex-1 p-2 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!currentBook}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
              activeTab === tab.id 
                ? 'bg-primary-600 text-white' 
                : currentBook 
                  ? 'hover:bg-sidebarHover text-gray-300' 
                  : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Footer Stats */}
      {currentBook && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>总字数</span>
              <span className="text-white">{totalWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>章节数</span>
              <span className="text-white">{chapters.length}</span>
            </div>
            <div className="flex justify-between">
              <span>目标字数</span>
              <span className="text-white">{wordCountTarget[0]}-{wordCountTarget[1]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
