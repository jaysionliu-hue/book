import { useStore } from '../../stores/useStore'

export default function Overview() {
  const { currentBook, chapters, characters, plot, wordCountTarget } = useStore()
  
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0)
  const draftCount = chapters.filter(ch => ch.status === 'draft').length
  const publishedCount = chapters.filter(ch => ch.status === 'published').length
  const mainPlotCount = plot.mainPlot.filter(p => p.status === 'ongoing').length
  const unresolvedForeshadow = plot.foreshadow.filter(f => f.status === 'unresolved').length
  
  return (
    <div className="p-6 space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📋</span> 作品概要
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-primary-600">{chapters.length}</div>
            <div className="text-sm text-gray-500">总章节数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总字数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">{draftCount}</div>
            <div className="text-sm text-gray-500">草稿</div>
          </div>
        </div>
        {currentBook?.summary && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500 mb-1">简介</div>
            <div className="text-gray-700">{currentBook.summary}</div>
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>📊</span> 创作进度
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">已完成章节</span>
              <span className="font-bold">{publishedCount} / {chapters.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${chapters.length ? (publishedCount / chapters.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>👥</span> 人物统计
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {characters.filter(c => c.category === 'protagonist').length}
              </div>
              <div className="text-xs text-gray-500">主角</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {characters.filter(c => c.category === 'supporting').length}
              </div>
              <div className="text-xs text-gray-500">配角</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">
                {characters.filter(c => c.category === 'antagonist').length}
              </div>
              <div className="text-xs text-gray-500">反派</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> 字数目标
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {wordCountTarget[0]}-{wordCountTarget[1]}
            </div>
            <div className="text-sm text-gray-500 mt-1">单章目标字数</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>🔮</span> 剧情追踪
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">进行中主线</span>
              <span className="font-bold">{mainPlotCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">未回收伏笔</span>
              <span className="font-bold text-orange-600">{unresolvedForeshadow}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
