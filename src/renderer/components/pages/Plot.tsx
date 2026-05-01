import { useState } from 'react'
import { useStore } from '../../stores/useStore'

export default function Plot() {
  const { plot, savePlot, chapters } = useStore()
  const [activeTab, setActiveTab] = useState<'main' | 'sub' | 'foreshadow'>('main')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ node: '', chapter: 1, status: 'ongoing' })
  
  const handleAddItem = () => {
    if (!newItem.node.trim()) return
    
    if (activeTab === 'main') {
      savePlot({
        ...plot,
        mainPlot: [...plot.mainPlot, { ...newItem, node: newItem.node, status: 'ongoing' }]
      })
    } else if (activeTab === 'sub') {
      savePlot({
        ...plot,
        subPlot: [...plot.subPlot, { ...newItem, node: newItem.node, status: 'ongoing' }]
      })
    } else {
      savePlot({
        ...plot,
        foreshadow: [...plot.foreshadow, { ...newItem, foreshadow: newItem.node, status: 'unresolved' }]
      })
    }
    
    setNewItem({ node: '', chapter: 1, status: 'ongoing' })
    setShowAddForm(false)
  }
  
  const handleUpdateStatus = (index: number, status: string) => {
    if (activeTab === 'main') {
      const updated = [...plot.mainPlot]
      updated[index].status = status
      savePlot({ ...plot, mainPlot: updated })
    } else if (activeTab === 'sub') {
      const updated = [...plot.subPlot]
      updated[index].status = status
      savePlot({ ...plot, subPlot: updated })
    } else {
      const updated = [...plot.foreshadow]
      updated[index].status = status
      savePlot({ ...plot, foreshadow: updated })
    }
  }
  
  const handleDeleteItem = (index: number) => {
    if (activeTab === 'main') {
      savePlot({ ...plot, mainPlot: plot.mainPlot.filter((_, i) => i !== index) })
    } else if (activeTab === 'sub') {
      savePlot({ ...plot, subPlot: plot.subPlot.filter((_, i) => i !== index) })
    } else {
      savePlot({ ...plot, foreshadow: plot.foreshadow.filter((_, i) => i !== index) })
    }
  }
  
  const getCurrentList = () => {
    if (activeTab === 'main') return plot.mainPlot
    if (activeTab === 'sub') return plot.subPlot
    return plot.foreshadow
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'ongoing': return 'bg-blue-100 text-blue-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'unresolved': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'ongoing': return '进行中'
      case 'paused': return '暂停'
      case 'unresolved': return '未回收'
      default: return status
    }
  }
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4">剧情进度控制台</h3>
      
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => { setActiveTab('main'); setShowAddForm(false) }}
          className={`pb-2 px-2 font-medium ${activeTab === 'main' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          主线剧情 ({plot.mainPlot.length})
        </button>
        <button
          onClick={() => { setActiveTab('sub'); setShowAddForm(false) }}
          className={`pb-2 px-2 font-medium ${activeTab === 'sub' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          支线剧情 ({plot.subPlot.length})
        </button>
        <button
          onClick={() => { setActiveTab('foreshadow'); setShowAddForm(false) }}
          className={`pb-2 px-2 font-medium ${activeTab === 'foreshadow' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          伏笔追踪 ({plot.foreshadow.length})
        </button>
      </div>
      
      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="mb-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
      >
        + 添加{activeTab === 'main' ? '主线' : activeTab === 'sub' ? '支线' : '伏笔'}
      </button>
      
      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                type="text"
                value={newItem.node}
                onChange={(e) => setNewItem({ ...newItem, node: e.target.value })}
                placeholder={activeTab === 'foreshadow' ? '输入伏笔内容' : '输入剧情节点'}
                className="w-full px-3 py-2 border rounded"
                autoFocus
              />
            </div>
            <div>
              <select
                value={newItem.chapter}
                onChange={(e) => setNewItem({ ...newItem, chapter: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              >
                {chapters.map((ch, i) => (
                  <option key={ch.id} value={i + 1}>第{i + 1}章</option>
                ))}
                <option value={0}>未开始</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddItem}
              disabled={!newItem.node.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500 disabled:bg-gray-300"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      {/* List */}
      <div className="space-y-2">
        {getCurrentList().length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无{activeTab === 'main' ? '主线' : activeTab === 'sub' ? '支线' : '伏笔'}剧情
          </div>
        ) : (
          getCurrentList().map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-sm"
            >
              <div className="w-12 text-center">
                <span className="text-sm text-gray-500">第{item.chapter || 0}章</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {activeTab === 'foreshadow' ? item.foreshadow : item.node}
                </div>
              </div>
              <select
                value={item.status}
                onChange={(e) => handleUpdateStatus(index, e.target.value)}
                className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${getStatusColor(item.status)}`}
              >
                {activeTab === 'foreshadow' ? (
                  <>
                    <option value="unresolved">未回收</option>
                    <option value="completed">已回收</option>
                  </>
                ) : (
                  <>
                    <option value="ongoing">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="paused">暂停</option>
                  </>
                )}
              </select>
              <button
                onClick={() => handleDeleteItem(index)}
                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{plot.mainPlot.filter(p => p.status === 'ongoing').length}</div>
          <div className="text-sm text-gray-600">进行中主线</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{plot.mainPlot.filter(p => p.status === 'completed').length}</div>
          <div className="text-sm text-gray-600">已完成主线</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{plot.subPlot.filter(p => p.status === 'ongoing').length}</div>
          <div className="text-sm text-gray-600">进行中支线</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{plot.foreshadow.filter(p => p.status === 'unresolved').length}</div>
          <div className="text-sm text-gray-600">待回收伏笔</div>
        </div>
      </div>
    </div>
  )
}
