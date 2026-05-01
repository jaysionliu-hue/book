import { useState } from 'react'
import { useStore } from '../../stores/useStore'

export default function Style() {
  const { styleProfile, addStyleSample, saveStyleProfile } = useStore()
  const [newSample, setNewSample] = useState('')
  const [showAddSample, setShowAddSample] = useState(false)
  
  const handleAddSample = async () => {
    if (!newSample.trim()) return
    await addStyleSample(newSample)
    setNewSample('')
    setShowAddSample(false)
  }
  
  const handleDeleteSample = (index: number) => {
    const newSamples = styleProfile.samples.filter((_, i) => i !== index)
    saveStyleProfile({ ...styleProfile, samples: newSamples })
  }
  
  const profile = styleProfile.profile
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4">文风学习库</h3>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Sample Management */}
        <div className="col-span-2">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">文风样本</h4>
              <button
                onClick={() => setShowAddSample(true)}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-500"
              >
                + 添加样本
              </button>
            </div>
            
            {showAddSample && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={newSample}
                  onChange={(e) => setNewSample(e.target.value)}
                  placeholder="粘贴你的原创作品片段，用于学习文风特征..."
                  className="w-full h-32 p-3 border rounded resize-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleAddSample}
                    disabled={!newSample.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500 disabled:bg-gray-300"
                  >
                    学习此样本
                  </button>
                  <button
                    onClick={() => { setShowAddSample(false); setNewSample('') }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {styleProfile.samples.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✍️</div>
                  <p>暂无文风样本</p>
                  <p className="text-sm mt-1">添加你的原创片段，系统将自动分析文风特征</p>
                </div>
              ) : (
                styleProfile.samples.map((sample, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400">样本 {index + 1}</span>
                      <button
                        onClick={() => handleDeleteSample(index)}
                        className="text-xs text-red-500 hover:bg-red-100 px-2 py-1 rounded"
                      >
                        删除
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">{sample}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Style Profile */}
        <div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium mb-4">文风特征分析</h4>
            
            {styleProfile.samples.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">添加样本后自动分析</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600">{profile.avgSentenceLength}</div>
                  <div className="text-sm text-gray-600">平均句长</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">短句比例</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${profile.shortSentenceRatio * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round(profile.shortSentenceRatio * 100)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-2">常用连接词</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.connectors.length > 0 ? (
                      profile.connectors.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{c}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">暂无数据</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-2">语气助词</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.particles.length > 0 ? (
                      profile.particles.map((p, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">{p}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">暂无数据</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Writing Tips */}
          <div className="bg-white border rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-3">写作提示</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>根据文风分析，在创作时应：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>保持句子长度在 {Math.max(0, profile.avgSentenceLength - 5)}-{profile.avgSentenceLength + 5} 字左右</li>
                <li>适当使用短句增加节奏感</li>
                {profile.connectors.length > 0 && (
                  <li>自然融入连接词：{profile.connectors.slice(0, 3).join('、')}</li>
                )}
                {profile.particles.length > 0 && (
                  <li>使用语气词增加人物特色</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
