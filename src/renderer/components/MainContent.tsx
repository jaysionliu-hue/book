import { useStore } from '../stores/useStore'
import Overview from './pages/Overview'
import Chapters from './pages/Chapters'
import Characters from './pages/Characters'
import Settings from './pages/Settings'
import Plot from './pages/Plot'
import Style from './pages/Style'

export default function MainContent() {
  const { currentBook, activeTab } = useStore()
  
  if (!currentBook) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-700">欢迎使用网文创作工作室</h2>
          <p className="text-gray-500 mt-2">点击左侧「+ 新建」创建您的第一部作品</p>
        </div>
      </div>
    )
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'chapters': return <Chapters />
      case 'characters': return <Characters />
      case 'settings': return <Settings />
      case 'plot': return <Plot />
      case 'style': return <Style />
      default: return <Overview />
    }
  }
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-white border-b flex items-center px-6 justify-between">
        <div>
          <h2 className="font-bold text-lg">{currentBook.name}</h2>
          <span className="text-xs text-gray-500">{currentBook.channel} · {currentBook.genre}</span>
        </div>
        <div className="flex gap-2">
          {currentBook.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{tag}</span>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
      
      {/* Footer */}
      <div className="h-8 bg-white border-t flex items-center px-6 text-xs text-gray-500 justify-between">
        <span>最后更新：{new Date(currentBook.updated_at).toLocaleString()}</span>
        <span>字数统计仅含正文内容</span>
      </div>
    </div>
  )
}
