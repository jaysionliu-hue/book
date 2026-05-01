import React, { useState } from 'react';
import { Book, WORLDVIEW_AGENT, CHARACTER_AGENT, PLOT_AGENT, CHAPTER_AGENT } from '../../utils/types';

interface OverviewProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
  settings?: any;
}

export default function Overview({ book, onUpdate, settings }: OverviewProps) {
  const [activeTab, setActiveTab] = useState<'setting' | 'story' | 'rules'>('setting');
  const [generating, setGenerating] = useState<string | null>(null);

  // AI生成内容
  const handleGenerate = async (type: string) => {
    if (!settings?.apiKey) {
      alert('请先在设置中配置DeepSeek API');
      return;
    }

    setGenerating(type);

    try {
      let content = '';

      switch (type) {
        case 'worldview':
          content = await window.api.ai.chat({
            systemPrompt: WORLDVIEW_AGENT.systemPrompt,
            userPrompt: WORLDVIEW_AGENT.generatePrompt(book.channel, book.genreName, book.tags),
          });
          onUpdate({
            settings: { ...book.settings, worldView: content },
          });
          break;

        case 'characters':
          content = await window.api.ai.chat({
            systemPrompt: CHARACTER_AGENT.systemPrompt,
            userPrompt: CHARACTER_AGENT.generatePrompt(book.genreName, book.coreSetting?.theme || '', book.characters),
          });
          try {
            const chars = JSON.parse(content);
            onUpdate({ characters: chars });
          } catch {
            onUpdate({ characters: [{
              id: '1',
              name: '待解析',
              type: 'protagonist',
              personality: [content],
            }]});
          }
          break;

        case 'plot':
          content = await window.api.ai.chat({
            systemPrompt: PLOT_AGENT.systemPrompt,
            userPrompt: PLOT_AGENT.generatePrompt(book.coreSetting?.theme || '', book.characters, 50),
          });
          onUpdate({
            storyStructure: { ...book.storyStructure, act1: content },
          });
          break;

        default:
          break;
      }
    } catch (error: any) {
      alert('生成失败: ' + (error.message || '未知错误'));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 核心设定 */}
      <section className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">核心设定模块</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">核心主题</label>
            <input
              type="text"
              value={book.coreSetting?.theme || ''}
              onChange={(e) => onUpdate({ coreSetting: { ...book.coreSetting, theme: e.target.value } })}
              placeholder="如：记忆与身份"
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">基调定位</label>
            <select
              value={book.coreSetting?.tone || ''}
              onChange={(e) => onUpdate({ coreSetting: { ...book.coreSetting, tone: e.target.value } })}
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
            >
              <option value="">选择基调</option>
              <option value="治愈">治愈</option>
              <option value="致郁">致郁</option>
              <option value="悬疑">悬疑</option>
              <option value="热血">热血</option>
              <option value="搞笑">搞笑</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400">一句话故事梗概</label>
            <input
              type="text"
              value={book.coreSetting?.oneLineSummary || ''}
              onChange={(e) => onUpdate({ coreSetting: { ...book.coreSetting, oneLineSummary: e.target.value } })}
              placeholder="50字内概括，包含主角、核心冲突与悬念"
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400">时代背景</label>
            <input
              type="text"
              value={book.coreSetting?.eraBackground || ''}
              onChange={(e) => onUpdate({ coreSetting: { ...book.coreSetting, eraBackground: e.target.value } })}
              placeholder="具体时间/时代背景"
              className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
            />
          </div>
        </div>
      </section>

      {/* 标签页 */}
      <div className="flex gap-2">
        {(['setting', 'story', 'rules'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === tab ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {tab === 'setting' ? '设定库' : tab === 'story' ? '故事架构' : '写作规范'}
          </button>
        ))}
      </div>

      {/* 设定库 */}
      {activeTab === 'setting' && (
        <section className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">设定库</h2>
            <button
              onClick={() => handleGenerate('worldview')}
              disabled={generating === 'worldview'}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm disabled:opacity-50 transition"
            >
              {generating === 'worldview' ? '生成中...' : '✨ AI生成世界观'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-2">世界观</h3>
              <textarea
                value={book.settings?.worldView || ''}
                onChange={(e) => onUpdate({ settings: { ...book.settings, worldView: e.target.value } })}
                placeholder="描述故事的核心世界观..."
                rows={6}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-gray-400 mb-2">势力分布</h3>
                <textarea
                  value={book.settings?.factions?.join('\n') || ''}
                  onChange={(e) => onUpdate({ settings: { ...book.settings, factions: e.target.value.split('\n') } })}
                  placeholder="每行一个势力"
                  rows={4}
                  className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-2">地理环境</h3>
                <textarea
                  value={book.settings?.geography?.join('\n') || ''}
                  onChange={(e) => onUpdate({ settings: { ...book.settings, geography: e.target.value.split('\n') } })}
                  placeholder="每行一个地点"
                  rows={4}
                  className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 故事架构 */}
      {activeTab === 'story' && (
        <section className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">故事架构</h2>
            <button
              onClick={() => handleGenerate('plot')}
              disabled={generating === 'plot'}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm disabled:opacity-50 transition"
            >
              {generating === 'plot' ? '生成中...' : '✨ AI生成大纲'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-2">第一幕（开端25%）</h3>
              <textarea
                value={book.storyStructure?.act1 || ''}
                onChange={(e) => onUpdate({ storyStructure: { ...book.storyStructure, act1: e.target.value } })}
                placeholder="日常世界→激励事件→第一次尝试→初步障碍"
                rows={4}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-2">第二幕（对抗50%）</h3>
              <textarea
                value={book.storyStructure?.act2 || ''}
                onChange={(e) => onUpdate({ storyStructure: { ...book.storyStructure, act2: e.target.value } })}
                placeholder="上升行动→中点转折→危机→绝望低谷→重整旗鼓"
                rows={4}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-2">第三幕（结局25%）</h3>
              <textarea
                value={book.storyStructure?.act3 || ''}
                onChange={(e) => onUpdate({ storyStructure: { ...book.storyStructure, act3: e.target.value } })}
                placeholder="高潮对决→降落行动→尾声"
                rows={4}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </section>
      )}

      {/* 写作规范 */}
      {activeTab === 'rules' && (
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">写作规范</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">叙事视角</label>
                <select
                  value={book.writingRules?.perspective || '第三人称有限视角'}
                  onChange={(e) => onUpdate({ writingRules: { ...book.writingRules, perspective: e.target.value } })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                >
                  <option value="第一人称">第一人称</option>
                  <option value="第三人称有限视角">第三人称有限视角</option>
                  <option value="第三人称全知">第三人称全知</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">段落字数限制</label>
                <input
                  type="number"
                  value={book.writingRules?.paragraphLimit || 80}
                  onChange={(e) => onUpdate({ writingRules: { ...book.writingRules, paragraphLimit: parseInt(e.target.value) } })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">写作风格</label>
              <input
                type="text"
                value={book.coreSetting?.writingStyle || ''}
                onChange={(e) => onUpdate({ coreSetting: { ...book.coreSetting, writingStyle: e.target.value } })}
                placeholder="如：冷峻写实、细腻走心、紧张刺激"
                className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">禁止事项</label>
              <textarea
                value={book.writingRules?.forbidden?.join('\n') || ''}
                onChange={(e) => onUpdate({ writingRules: { ...book.writingRules, forbidden: e.target.value.split('\n') } })}
                placeholder="每行一条禁止规则"
                rows={3}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </section>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{book.characters?.length || 0}</div>
          <div className="text-sm text-gray-400">人物</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{book.chapters?.length || 0}</div>
          <div className="text-sm text-gray-400">章节</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{book.totalWordCount?.toLocaleString() || 0}</div>
          <div className="text-sm text-gray-400">总字数</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{book.plotPoints?.filter((p: any) => p.status === 'completed').length || 0}</div>
          <div className="text-sm text-gray-400">已回收伏笔</div>
        </div>
      </div>
    </div>
  );
}
