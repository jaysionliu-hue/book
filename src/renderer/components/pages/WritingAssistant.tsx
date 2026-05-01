import React, { useState } from 'react';
import { Book, DIALOGUE_AGENT, DESCRIPTION_AGENT, CONFLICT_AGENT } from '../../utils/types';

interface WritingAssistantProps {
  book: Book;
  settings?: any;
}

export default function WritingAssistant({ book, settings }: WritingAssistantProps) {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'description' | 'conflict'>('dialogue');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!settings?.apiKey) {
      alert('请先在设置中配置DeepSeek API');
      return;
    }

    if (!input.trim()) return;

    setGenerating(true);
    setResult('');

    try {
      let agent: any;

      switch (activeTab) {
        case 'dialogue':
          agent = DIALOGUE_AGENT;
          break;
        case 'description':
          agent = DESCRIPTION_AGENT;
          break;
        case 'conflict':
          agent = CONFLICT_AGENT;
          break;
      }

      const content = await window.api.ai.chat({
        systemPrompt: agent.systemPrompt,
        userPrompt: agent.generatePrompt(book, input),
      });

      setResult(content);
    } catch (error: any) {
      setResult('生成失败: ' + (error.message || '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: 'dialogue', label: '对话生成', desc: '生成自然的人物对话' },
    { id: 'description', label: '环境描写', desc: '生成场景与环境描写' },
    { id: 'conflict', label: '冲突设计', desc: '设计人物冲突与对峙' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">写作助手</h1>

      {/* 工具切换 */}
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setInput(''); setResult(''); }}
            className={`flex-1 p-4 rounded-xl transition ${
              activeTab === tab.id
                ? 'bg-blue-500'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="font-medium">{tab.label}</div>
            <div className="text-sm text-gray-400 mt-1">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* 输入 */}
      <div className="bg-slate-800 rounded-xl p-6">
        <label className="block text-sm text-gray-400 mb-2">
          {activeTab === 'dialogue' && '输入场景要求（人物、情境、情绪等）'}
          {activeTab === 'description' && '输入场景描述（时间、地点、氛围等）'}
          {activeTab === 'conflict' && '输入冲突场景（涉及人物、冲突原因等）'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            activeTab === 'dialogue'
              ? '例如：男主发现女主在偷偷哭泣，他想要安慰但又不知如何开口...'
              : activeTab === 'description'
              ? '例如：深夜的便利店，霓虹灯闪烁，空气中弥漫着咖啡香...'
              : '例如：女主撞见未婚夫和闺蜜在一起，三人对峙...'
          }
          rows={4}
          className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={generating || !input.trim()}
          className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50 transition"
        >
          {generating ? '生成中...' : '✨ 生成'}
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">生成结果</h2>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              复制
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}

      {/* 提示 */}
      <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-gray-400">
        <p className="mb-2">💡 使用提示：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>提供越详细的上下文，生成效果越好</li>
          <li>生成结果可复制到章节编辑器中使用</li>
          <li>如效果不理想，可以调整输入重新生成</li>
        </ul>
      </div>
    </div>
  );
}
