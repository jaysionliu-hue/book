import { useState } from 'react'
import { useStore } from '../../stores/useStore'

export default function Chapters() {
  const { chapters, createChapter, updateChapter, deleteChapter, currentBook, wordCountTarget } = useStore()
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [showNewChapter, setShowNewChapter] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  
  const handleCreateChapter = async () => {
    if (!newTitle.trim()) return
    const order = chapters.length + 1
    await createChapter({
      book_id: currentBook!.id,
      title: newTitle,
      content: '',
      chapter_order: order,
      status: 'draft',
    })
    setNewTitle('')
    setShowNewChapter(false)
  }
  
  const handleSaveChapter = async () => {
    if (!editingChapter) return
    await updateChapter(editingChapter.id, {
      title: editingChapter.title,
      content: editingChapter.content,
      status: editingChapter.status,
    })
    setEditingChapter(null)
  }
  
  const handleDeleteChapter = async (id: string) => {
    if (!confirm('确定删除此章节？')) return
    await deleteChapter(id)
    if (editingChapter?.id === id) {
      setEditingChapter(null)
    }
  }
  
  const getWordCount = (content: string) => content?.length || 0
  const isWithinTarget = (count: number) => count >= wordCountTarget[0] && count <= wordCountTarget[1]
  
  if (editingChapter) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={editingChapter.title}
              onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
              className="text-xl font-bold px-3 py-1 border rounded focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={editingChapter.status}
              onChange={(e) => setEditingChapter({ ...editingChapter, status: e.target.value })}
              className="px-3 py-1 border rounded"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingChapter(null)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSaveChapter}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
            >
              保存
            </button>
          </div>
        </div>
        
        <textarea
          value={editingChapter.content}
          onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
          className="w-full h-[calc(100vh-280px)] p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
          placeholder="开始写作..."
        />
        
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={isWithinTarget(getWordCount(editingChapter.content)) ? 'text-green-600' : 'text-orange-600'}>
            字数：{getWordCount(editingChapter.content)} / 目标：{wordCountTarget[0]}-{wordCountTarget[1]}
          </span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">章节列表</h3>
        <button
          onClick={() => setShowNewChapter(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
        >
          + 新建章节
        </button>
      </div>
      
      {showNewChapter && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="章节标题"
            className="flex-1 px-3 py-2 border rounded"
            autoFocus
          />
          <button
            onClick={handleCreateChapter}
            disabled={!newTitle.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500 disabled:bg-gray-300"
          >
            创建
          </button>
          <button
            onClick={() => { setShowNewChapter(false); setNewTitle('') }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            取消
          </button>
        </div>
      )}
      
      <div className="space-y-2">
        {chapters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无章节，点击上方按钮创建第一章
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="flex items-center p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setEditingChapter(chapter)}
            >
              <div className="w-12 text-center">
                <div className="text-gray-400 font-medium">第{index + 1}章</div>
              </div>
              <div className="flex-1 ml-4">
                <div className="font-medium">{chapter.title || '无标题'}</div>
                <div className="text-sm text-gray-500 mt-1">
                  字数：{getWordCount(chapter.content)} | 
                  状态：<span className={chapter.status === 'published' ? 'text-green-600' : 'text-orange-600'}>
                    {chapter.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${
                isWithinTarget(getWordCount(chapter.content)) 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {isWithinTarget(getWordCount(chapter.content)) ? '✓达标' : '!字数异常'}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id) }}
                className="ml-4 px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
