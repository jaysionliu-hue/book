import React, { useState } from 'react';
import { Book, Character, AGENTS } from '../../utils/types';

interface CharactersProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
  settings?: any;
}

const EMPTY_CHARACTER: Partial<Character> = {
  name: '',
  type: 'protagonist',
  personality: [],
  motivation: '',
  fear: '',
  background: '',
  arc: '',
};

export default function Characters({ book, onUpdate, settings }: CharactersProps) {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [editingChar, setEditingChar] = useState<Partial<Character>>(EMPTY_CHARACTER);
  const [generating, setGenerating] = useState(false);

  const characters = book.characters || [];
  const currentChar = characters.find((c) => c.id === selectedChar);

  // 选中角色
  React.useEffect(() => {
    if (currentChar) {
      setEditingChar(currentChar);
    } else {
      setEditingChar(EMPTY_CHARACTER);
    }
  }, [selectedChar]);

  // 保存角色
  const handleSave = () => {
    if (!editingChar.name) {
      alert('请输入角色名称');
      return;
    }

    if (selectedChar) {
      const updated = characters.map((c) =>
        c.id === selectedChar ? { ...c, ...editingChar } : c
      );
      onUpdate({ characters: updated });
    } else {
      const newChar: Character = {
        id: Date.now().toString(),
        name: editingChar.name || '',
        type: editingChar.type || 'protagonist',
        age: editingChar.age,
        occupation: editingChar.occupation,
        appearance: editingChar.appearance,
        personality: editingChar.personality || [],
        motivation: editingChar.motivation,
        fear: editingChar.fear,
        background: editingChar.background,
        relationships: editingChar.relationships,
        arc: editingChar.arc,
        secrets: editingChar.secrets,
        habits: editingChar.habits,
        quote: editingChar.quote,
      };
      onUpdate({ characters: [...characters, newChar] });
      setSelectedChar(newChar.id);
    }
  };

  // 删除角色
  const handleDelete = () => {
    if (!selectedChar) return;
    if (!confirm('确定删除这个角色吗？')) return;
    const updated = characters.filter((c) => c.id !== selectedChar);
    onUpdate({ characters: updated });
    setSelectedChar(null);
    setEditingChar(EMPTY_CHARACTER);
  };

  // 新建角色
  const handleNew = () => {
    setSelectedChar(null);
    setEditingChar(EMPTY_CHARACTER);
  };

  // AI生成角色
  const handleGenerate = async () => {
    if (!settings?.apiKey) {
      alert('请先在设置中配置DeepSeek API');
      return;
    }

    setGenerating(true);

    try {
      const generated = await window.api.ai.chat({
        systemPrompt: AGENTS['character'].systemPrompt,
        userPrompt: AGENTS['character'].generatePrompt(book.genreName, book.coreSetting?.theme || '', characters),
      });

      try {
        const chars = JSON.parse(generated);
        if (Array.isArray(chars)) {
          onUpdate({ characters: [...characters, ...chars.map((c: any, i: number) => ({
            ...c,
            id: (Date.now() + i).toString(),
          }))]});
        }
      } catch {
        setEditingChar({
          ...EMPTY_CHARACTER,
          personality: [generated],
        });
      }
    } catch (error: any) {
      alert('生成失败: ' + (error.message || '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  const groupedChars = {
    protagonist: characters.filter((c) => c.type === 'protagonist'),
    supporting: characters.filter((c) => c.type === 'supporting'),
    antagonist: characters.filter((c) => c.type === 'antagonist'),
  };

  return (
    <div className="flex gap-6 h-full">
      {/* 角色列表 */}
      <div className="w-72 bg-slate-800 rounded-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">人物档案库</h2>
          <button
            onClick={handleNew}
            className="text-blue-400 hover:text-blue-300 text-xl"
          >
            +
          </button>
        </div>

        {/* 主角 */}
        <div className="mb-4">
          <h3 className="text-xs text-gray-400 uppercase mb-2">主角</h3>
          <div className="space-y-1">
            {groupedChars.protagonist.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.id)}
                className={`w-full p-2 rounded-lg text-left text-sm transition ${
                  selectedChar === char.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                }`}
              >
                {char.name || '未命名'}
              </button>
            ))}
          </div>
        </div>

        {/* 配角 */}
        <div className="mb-4">
          <h3 className="text-xs text-gray-400 uppercase mb-2">配角</h3>
          <div className="space-y-1">
            {groupedChars.supporting.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.id)}
                className={`w-full p-2 rounded-lg text-left text-sm transition ${
                  selectedChar === char.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                }`}
              >
                {char.name || '未命名'}
              </button>
            ))}
          </div>
        </div>

        {/* 反派 */}
        <div className="mb-4">
          <h3 className="text-xs text-gray-400 uppercase mb-2">反派</h3>
          <div className="space-y-1">
            {groupedChars.antagonist.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.id)}
                className={`w-full p-2 rounded-lg text-left text-sm transition ${
                  selectedChar === char.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                }`}
              >
                {char.name || '未命名'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm disabled:opacity-50 transition mt-4"
        >
          {generating ? '生成中...' : '✨ AI生成角色'}
        </button>
      </div>

      {/* 角色详情 */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 基本信息 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">姓名 *</label>
                <input
                  type="text"
                  value={editingChar.name || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                  placeholder="角色姓名"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">类型</label>
                <select
                  value={editingChar.type || 'protagonist'}
                  onChange={(e) => setEditingChar({ ...editingChar, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                >
                  <option value="protagonist">主角</option>
                  <option value="supporting">配角</option>
                  <option value="antagonist">反派</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">年龄</label>
                <input
                  type="text"
                  value={editingChar.age || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, age: e.target.value })}
                  placeholder="如：25岁"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
              <div className="col-span-3">
                <label className="text-sm text-gray-400">职业/身份</label>
                <input
                  type="text"
                  value={editingChar.occupation || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, occupation: e.target.value })}
                  placeholder="详细职位"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
            </div>
          </section>

          {/* 深层背景 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">深层背景</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">童年关键事件</label>
                <textarea
                  value={editingChar.background || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, background: e.target.value })}
                  placeholder="创伤或转折事件"
                  rows={2}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">核心恐惧（含原因）</label>
                  <textarea
                    value={editingChar.fear || ''}
                    onChange={(e) => setEditingChar({ ...editingChar, fear: e.target.value })}
                    rows={2}
                    className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">内心渴望（驱动力）</label>
                  <textarea
                    value={editingChar.motivation || ''}
                    onChange={(e) => setEditingChar({ ...editingChar, motivation: e.target.value })}
                    rows={2}
                    className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1 resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 性格与行为 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">性格与行为特征</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">性格关键词</label>
                <input
                  type="text"
                  value={editingChar.personality?.join('、') || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, personality: e.target.value.split('、') })}
                  placeholder="如：冷静、果断、外冷内热"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">说话习惯/口头禅</label>
                <input
                  type="text"
                  value={editingChar.quote || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, quote: e.target.value })}
                  placeholder="标志性口头禅"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">习惯动作/小动作</label>
                <input
                  type="text"
                  value={editingChar.habits || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, habits: e.target.value })}
                  placeholder="紧张时的习惯"
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
            </div>
          </section>

          {/* 人物弧光 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">人物弧光</h3>
            <textarea
              value={editingChar.arc || ''}
              onChange={(e) => setEditingChar({ ...editingChar, arc: e.target.value })}
              placeholder="从A状态到B状态的成长轨迹，含性格缺陷与成长点"
              rows={3}
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none resize-none"
            />
          </section>

          {/* 隐藏秘密 */}
          <section>
            <h3 className="text-lg font-semibold mb-4">隐藏秘密</h3>
            <textarea
              value={editingChar.secrets || ''}
              onChange={(e) => setEditingChar({ ...editingChar, secrets: e.target.value })}
              placeholder="不为人知的秘密"
              rows={2}
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none resize-none"
            />
          </section>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-4 border-t border-slate-700">
            <button
              onClick={handleDelete}
              disabled={!selectedChar}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg disabled:opacity-50 transition"
            >
              删除角色
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
