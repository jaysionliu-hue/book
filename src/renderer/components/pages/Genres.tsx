import React, { useState, useEffect } from 'react';
import { Genre } from '../utils/types';

declare global {
  interface Window {
    api: {
      genres: {
        list: () => Promise<Genre[]>;
        add: (genre: Genre) => Promise<boolean>;
        update: (id: string, data: Partial<Genre>) => Promise<boolean>;
        delete: (id: string) => Promise<boolean>;
      };
    };
  }
}

const defaultGenres: Genre[] = [
  { id: 'female-ancient', name: '古言', channel: 'female', description: '古代背景的言情小说', tags: ['宫斗', '宅斗', '穿越', '种田'] },
  { id: 'female-modern', name: '现言', channel: 'female', description: '现代背景的言情小说', tags: ['甜宠', '虐恋', '总裁', '职场'] },
  { id: 'female-fantasy', name: '玄幻言情', channel: 'female', description: '带有玄幻元素的言情小说', tags: ['修仙', '异世', '神兽', '升级'] },
  { id: 'male-fantasy', name: '玄幻', channel: 'male', description: '男性向玄幻小说', tags: ['修炼', '升级', '爽文', '热血'] },
  { id: 'male-urban', name: '都市', channel: 'male', description: '男性向都市小说', tags: ['重生', '系统', '逆袭', '异能'] },
  { id: 'male-xianxia', name: '仙侠', channel: 'male', description: '男性向仙侠小说', tags: ['修真', '飞升', '门派', '奇遇'] },
];

const Genres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Genre>>({
    name: '',
    channel: 'female',
    description: '',
    tags: [],
    writingRules: {}
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const data = await window.api.genres.list();
      if (data.length === 0) {
        // 初始化默认题材
        for (const genre of defaultGenres) {
          await window.api.genres.add(genre);
        }
        setGenres(defaultGenres);
      } else {
        setGenres(data);
      }
    } catch (error) {
      console.error('加载题材失败:', error);
      setGenres(defaultGenres);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      alert('请输入题材名称');
      return;
    }
    try {
      const newGenre: Genre = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        channel: formData.channel || 'female',
        description: formData.description || '',
        tags: formData.tags || [],
        writingRules: formData.writingRules || {}
      };
      await window.api.genres.add(newGenre);
      setGenres([...genres, newGenre]);
      setShowAddForm(false);
      setFormData({ name: '', channel: 'female', description: '', tags: [], writingRules: {} });
    } catch (error) {
      console.error('添加题材失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个题材吗？')) return;
    try {
      await window.api.genres.delete(id);
      setGenres(genres.filter(g => g.id !== id));
    } catch (error) {
      console.error('删除题材失败:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) || [] });
  };

  const femaleGenres = genres.filter(g => g.channel === 'female');
  const maleGenres = genres.filter(g => g.channel === 'male');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">题材分类管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
        >
          + 新建题材
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">新建题材</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">题材名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：都市重生"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">频道</label>
              <select
                value={formData.channel}
                onChange={e => setFormData({ ...formData, channel: e.target.value as 'female' | 'male' })}
                className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="female">女频</option>
                <option value="male">男频</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">简介</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="题材描述"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">标签</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入标签后回车"
              />
              <button onClick={handleAddTag} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded">
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-300">×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
              保存
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 女频题材 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-pink-400">女频题材</h3>
        <div className="grid grid-cols-3 gap-4">
          {femaleGenres.map(genre => (
            <div key={genre.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{genre.name}</h4>
                <button
                  onClick={() => handleDelete(genre.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  删除
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">{genre.description}</p>
              <div className="flex flex-wrap gap-1">
                {genre.tags?.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 男频题材 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-blue-400">男频题材</h3>
        <div className="grid grid-cols-3 gap-4">
          {maleGenres.map(genre => (
            <div key={genre.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{genre.name}</h4>
                <button
                  onClick={() => handleDelete(genre.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  删除
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">{genre.description}</p>
              <div className="flex flex-wrap gap-1">
                {genre.tags?.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Genres;
