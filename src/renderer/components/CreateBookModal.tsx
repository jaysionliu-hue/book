import { useState } from 'react'
import { useStore } from '../stores/useStore'

const channels = ['女频', '男频']

const genres = {
  女频: [
    { id: 'modern-romance', name: '现代言情', tags: ['豪门总裁', '都市异能', '重生复仇', '甜宠文', '校园'] },
    { id: 'ancient-romance', name: '古言', tags: ['宫斗', '宅斗', '种田', '仙侠', '穿越'] },
    { id: 'other-female', name: '其他', tags: ['快穿', '悬疑', '电竞', '民国'] },
  ],
  男频: [
    { id: 'urban-fantasy', name: '都市玄幻', tags: ['都市', '修仙', '异能', '兵王', '神医'] },
    { id: 'xianxia', name: '仙侠', tags: ['凡人流', '系统', '同人', '洪荒'] },
    { id: 'fantasy', name: '奇幻', tags: ['西幻', '异世', '游戏', '领主'] },
    { id: 'other-male', name: '其他', tags: ['悬疑', '科幻', '历史', '都市'] },
  ]
}

export default function CreateBookModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    channel: '',
    genre: '',
    genreName: '',
    tags: [] as string[],
    summary: '',
  })
  const { createBook, setCurrentBook } = useStore()
  
  const handleChannelSelect = (channel: string) => {
    setFormData(prev => ({ ...prev, channel, genre: '', genreName: '', tags: [] }))
    setStep(2)
  }
  
  const handleGenreSelect = (genre: string, genreName: string) => {
    setFormData(prev => ({ ...prev, genre, genreName, tags: [] }))
    setStep(3)
  }
  
  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < 5 ? [...prev.tags, tag] : prev.tags
    }))
  }
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    await createBook({
      name: formData.name,
      channel: formData.channel,
      genre: formData.genreName,
      tags: formData.tags,
      summary: formData.summary,
    })
    onClose()
  }
  
  const currentGenreTags = genres[formData.channel as keyof typeof genres]?.find(g => g.id === formData.genre)?.tags || []
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold">创建新作品</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        
        {/* Progress */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-2 text-sm">
          <span className={step >= 1 ? 'text-primary-600 font-bold' : 'text-gray-400'}>1.选择频道</span>
          <span className="text-gray-300">→</span>
          <span className={step >= 2 ? 'text-primary-600 font-bold' : 'text-gray-400'}>2.选择题材</span>
          <span className="text-gray-300">→</span>
          <span className={step >= 3 ? 'text-primary-600 font-bold' : 'text-gray-400'}>3.选择标签</span>
          <span className="text-gray-300">→</span>
          <span className={step >= 4 ? 'text-primary-600 font-bold' : 'text-gray-400'}>4.填写信息</span>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Channel */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {channels.map(channel => (
                <button
                  key={channel}
                  onClick={() => handleChannelSelect(channel)}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <div className="text-4xl mb-2">{channel === '女频' ? '👩' : '👨'}</div>
                  <div className="text-xl font-bold group-hover:text-primary-600">{channel}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {channel === '女频' ? '言情、甜宠、虐恋' : '玄幻、都市、爽文'}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Step 2: Genre */}
          {step === 2 && (
            <div>
              <p className="text-gray-600 mb-4">选择<span className="font-bold text-primary-600">{formData.channel}</span>题材分类：</p>
              <div className="grid grid-cols-2 gap-3">
                {genres[formData.channel as keyof typeof genres]?.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre.id, genre.name)}
                    className="p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                  >
                    <div className="font-bold">{genre.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{genre.tags.slice(0, 3).join(' / ')}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">← 返回</button>
            </div>
          )}
          
          {/* Step 3: Tags */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">选择标签（最多5个，已选 <span className="font-bold text-primary-600">{formData.tags.length}</span> 个）：</p>
                <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700">← 返回</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentGenreTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(4)} 
                className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors font-bold"
              >
                下一步 →
              </button>
            </div>
          )}
          
          {/* Step 4: Book Info */}
          {step === 4 && (
            <div>
              <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← 返回</button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">书名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入书名"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="请输入作品简介（可选）"
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">确认信息：</div>
                  <div className="mt-2 space-y-1">
                    <div><span className="text-gray-500">频道：</span>{formData.channel}</div>
                    <div><span className="text-gray-500">题材：</span>{formData.genreName}</div>
                    <div><span className="text-gray-500">标签：</span>{formData.tags.join(' / ') || '未选择'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {step === 4 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold"
            >
              创建作品
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
