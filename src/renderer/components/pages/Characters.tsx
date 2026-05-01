import { useState } from 'react'
import { useStore } from '../../stores/useStore'

const categories = [
  { id: 'protagonist', label: '主角', color: 'blue' },
  { id: 'supporting', label: '配角', color: 'yellow' },
  { id: 'antagonist', label: '反派', color: 'red' },
]

export default function Characters() {
  const { characters, currentBook, createCharacter, updateCharacter, deleteCharacter } = useStore()
  const [showNewChar, setShowNewChar] = useState(false)
  const [editingChar, setEditingChar] = useState<any>(null)
  const [newChar, setNewChar] = useState({
    name: '',
    category: 'protagonist' as string,
  })
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  const handleCreateChar = async () => {
    if (!newChar.name.trim()) return
    await createCharacter({
      book_id: currentBook!.id,
      name: newChar.name,
      category: newChar.category,
      data: {
        name: newChar.name,
        personality: '',
        background: '',
        desires: '',
        weaknesses: '',
        relationships: '',
        secrets: '',
        growth: '',
        appearance: '',
        speechStyle: '',
      },
    })
    setNewChar({ name: '', category: 'protagonist' })
    setShowNewChar(false)
  }
  
  const handleSaveChar = async () => {
    if (!editingChar) return
    await updateCharacter(editingChar.id, editingChar.data)
    setEditingChar(null)
  }
  
  const filteredChars = filterCategory === 'all' 
    ? characters 
    : characters.filter(c => c.category === filterCategory)
  
  if (editingChar) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">编辑人物：{editingChar.data.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingChar(null)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSaveChar}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
            >
              保存
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={editingChar.data.name}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, name: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色定位</label>
            <select
              value={editingChar.category}
              onChange={(e) => setEditingChar({ ...editingChar, category: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性格底色</label>
            <input
              type="text"
              value={editingChar.data.personality}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, personality: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="如：表面温和、内心偏执"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">核心欲望</label>
            <input
              type="text"
              value={editingChar.data.desires}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, desires: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="角色最想要什么"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">软肋/执念</label>
            <input
              type="text"
              value={editingChar.data.weaknesses}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, weaknesses: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="角色的弱点或执念"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">过往经历</label>
            <input
              type="text"
              value={editingChar.data.background}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, background: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="塑造角色的关键经历"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">外貌特征</label>
            <input
              type="text"
              value={editingChar.data.appearance}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, appearance: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="独特的外貌特征"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">说话风格</label>
            <input
              type="text"
              value={editingChar.data.speechStyle}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, speechStyle: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              placeholder="口头禅、说话习惯"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">人际关系</label>
            <textarea
              value={editingChar.data.relationships}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, relationships: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
              placeholder="与谁有什么关系"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">隐藏秘密</label>
            <textarea
              value={editingChar.data.secrets}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, secrets: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
              placeholder="只有你知道的事"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">成长轨迹</label>
            <textarea
              value={editingChar.data.growth}
              onChange={(e) => setEditingChar({
                ...editingChar,
                data: { ...editingChar.data, growth: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
              placeholder="角色如何成长/转变"
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">人物档案库</h3>
        <button
          onClick={() => setShowNewChar(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
        >
          + 新建人物
        </button>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full text-sm ${filterCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          全部
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              filterCategory === c.id 
                ? c.color === 'blue' ? 'bg-blue-600 text-white' 
                  : c.color === 'yellow' ? 'bg-yellow-500 text-white' 
                  : 'bg-red-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      
      {/* New Character */}
      {showNewChar && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
          <input
            type="text"
            value={newChar.name}
            onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
            placeholder="人物姓名"
            className="flex-1 px-3 py-2 border rounded"
            autoFocus
          />
          <select
            value={newChar.category}
            onChange={(e) => setNewChar({ ...newChar, category: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={handleCreateChar}
            disabled={!newChar.name.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500 disabled:bg-gray-300"
          >
            创建
          </button>
          <button
            onClick={() => { setShowNewChar(false); setNewChar({ name: '', category: 'protagonist' }) }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            取消
          </button>
        </div>
      )}
      
      {/* Character List */}
      <div className="grid grid-cols-3 gap-4">
        {filteredChars.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            暂无人物，点击上方按钮创建
          </div>
        ) : (
          filteredChars.map(char => (
            <div
              key={char.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setEditingChar(char)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{char.data?.name || char.name}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  char.category === 'protagonist' ? 'bg-blue-100 text-blue-700' 
                    : char.category === 'supporting' ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {categories.find(c => c.id === char.category)?.label}
                </span>
              </div>
              <div className="text-sm text-gray-500 line-clamp-2">
                {char.data?.personality || '未填写性格'}
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id) }}
                  className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
