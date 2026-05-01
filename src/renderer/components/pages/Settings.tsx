import { useState, useEffect } from 'react'
import { useStore } from '../../stores/useStore'

const settingCategories = [
  { id: 'world', label: '世界观', icon: '🌍' },
  { id: 'factions', label: '势力体系', icon: '🏛️' },
  { id: 'rules', label: '规则法则', icon: '⚖️' },
  { id: 'geography', label: '地理背景', icon: '🗺️' },
  { id: 'items', label: '道具宝物', icon: '💎' },
  { id: 'timeline', label: '时间线', icon: '⏰' },
]

export default function Settings() {
  const { currentBook } = useStore()
  const [activeCategory, setActiveCategory] = useState('world')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  
  useEffect(() => {
    loadSettings()
  }, [currentBook])
  
  const loadSettings = async () => {
    if (!currentBook) return
    const allSettings = await window.api.settings.list(currentBook.id)
    const settingsMap: Record<string, string> = {}
    allSettings.forEach((s: any) => {
      settingsMap[s.key] = s.content
    })
    setSettings(settingsMap)
  }
  
  const handleSave = async () => {
    if (!currentBook) return
    const existing = await window.api.settings.list(currentBook.id)
    const existingMap = new Map(existing.map((s: any) => [s.key, s.id]))
    
    for (const [key, content] of Object.entries(settings)) {
      if (existingMap.has(key)) {
        await window.api.settings.update(existingMap.get(key)!, content)
      } else {
        await window.api.settings.create({
          id: `setting_${Date.now()}_${key}`,
          book_id: currentBook.id,
          category: activeCategory,
          key,
          content,
          created_at: Date.now(),
          updated_at: Date.now(),
        })
      }
    }
    setEditing(false)
  }
  
  const handleEdit = () => {
    setEditContent(settings[activeCategory] || '')
    setEditing(true)
  }
  
  const handleChange = (value: string) => {
    setEditContent(value)
    setSettings(prev => ({ ...prev, [activeCategory]: value }))
  }
  
  const getTemplate = (category: string) => {
    const templates: Record<string, string> = {
      world: `# 世界观设定

## 核心法则
描述这个世界的核心运行规则

## 力量体系
修炼/能力等级划分

## 社会结构
等级制度、组织势力

## 特殊设定
本世界独有的规则`,
      factions: `# 势力体系

## 主要势力
- 势力A：
  - 领袖：
  - 宗旨：
  - 实力：

## 势力关系
- A vs B：
- A vs C：`,
      rules: `# 规则法则

## 修炼规则
等级划分与突破条件

## 战斗规则
战斗体系设定

## 社会规则
法律、道德、禁忌`,
      geography: `# 地理背景

## 主要区域
### 区域A
- 描述：
- 势力：
- 特色：

### 区域B
- 描述：
- 势力：
- 特色：`,
      items: `# 道具宝物

## 神器
- 名称：
- 能力：
- 来历：

## 重要道具
- 名称：
- 能力：
- 持有者：`,
      timeline: `# 时间线

## 重要事件
| 时间 | 事件 | 影响 |
|------|------|------|
| | | |
`,
    }
    return templates[category] || ''
  }
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4">全书设定库</h3>
      
      <div className="flex gap-6">
        {/* Category List */}
        <div className="w-48">
          {settingCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-primary-100 text-primary-700 font-bold' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          {editing ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{settingCategories.find(c => c.id === activeCategory)?.label}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleChange(getTemplate(activeCategory))
                    }}
                    className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded"
                  >
                    填充模板
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1 bg-primary-600 text-white rounded hover:bg-primary-500"
                  >
                    保存
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="输入设定内容..."
              />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{settingCategories.find(c => c.id === activeCategory)?.label}</span>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
                >
                  编辑
                </button>
              </div>
              <div className="flex-1 bg-white border rounded-lg p-4 overflow-y-auto">
                {settings[activeCategory] ? (
                  <pre className="whitespace-pre-wrap text-sm font-sans">{settings[activeCategory]}</pre>
                ) : (
                  <div className="text-gray-400 text-center py-12">
                    <div className="text-4xl mb-2">📝</div>
                    <p>暂无设定内容</p>
                    <button
                      onClick={handleEdit}
                      className="mt-2 text-primary-600 hover:underline"
                    >
                      点击添加
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
