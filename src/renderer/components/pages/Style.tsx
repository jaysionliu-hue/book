import React, { useState } from 'react';
import { Book, STYLE_ANALYSIS_AGENT } from '../../utils/types';

interface StyleProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
  settings?: any;
}

interface StyleSample {
  id: string;
  content: string;
  analysis?: {
    sentenceLength: string;
    shortSentence: number;
    connectors: string[];
    punctuation: string[];
    tone: string[];
  };
}

export default function Style({ book, onUpdate, settings }: StyleProps) {
  const [samples, setSamples] = useState<StyleSample[]>(book.samples || []);
  const [newContent, setNewContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  // 分析文风
  const handleAnalyze = async () => {
    if (!newContent.trim()) return;

    if (!settings?.apiKey) {
      alert('请先在设置中配置DeepSeek API');
      return;
    }

    setAnalyzing(true);

    try {
      const analysis = await window.api.ai.chat({
        systemPrompt: STYLE_ANALYSIS_AGENT.systemPrompt,
        userPrompt: STYLE_ANALYSIS_AGENT.generatePrompt(newContent),
      });

      const sample: StyleSample = {
        id: Date.now().toString(),
        content: newContent,
        analysis: JSON.parse(analysis),
      };

      const updated = [...samples, sample];
      setSamples(updated);
      setNewContent('');
      onUpdate({ samples: updated });
    } catch (error: any) {
      alert('分析失败: ' + (error.message || '未知错误'));
    } finally {
      setAnalyzing(false);
    }
  };

  // 删除样本
  const handleDelete = (id: string) => {
    const updated = samples.filter((s) => s.id !== id);
    setSamples(updated);
    onUpdate({ samples: updated });
    if (selectedSample === id) setSelectedSample(null);
  };

  // 应用文风
  const handleApply = (sample: StyleSample) => {
    onUpdate({
      style: {
        sentenceLength: sample.analysis?.sentenceLength || '中等',
        shortSentence: sample.analysis?.shortSentence || 0.3,
        connectors: sample.analysis?.connectors || [],
        punctuation: sample.analysis?.punctuation || [],
        tone: sample.analysis?.tone || [],
      },
    });
    alert('文风已应用');
  };

  return (
    <div className="flex gap-6 h-full">
      {/* 样本列表 */}
      <div className="w-80 bg-slate-800 rounded-xl p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">文风样本库</h2>

        <div className="space-y-2">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className={`p-3 bg-slate-700/50 rounded-lg cursor-pointer transition ${
                selectedSample === sample.id ? 'ring-2 ring-blue-500' : ''
              } hover:bg-slate-700`}
              onClick={() => setSelectedSample(sample.id)}
            >
              <div className="text-sm line-clamp-2">{sample.content.slice(0, 100)}...</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleApply(sample); }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  应用
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(sample.id); }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {samples.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>暂无文风样本</p>
            <p className="text-sm mt-1">粘贴你的原创内容开始学习</p>
          </div>
        )}
      </div>

      {/* 主内容 */}
      <div className="flex-1 space-y-6">
        {/* 添加新样本 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">添加文风样本</h2>
          <p className="text-sm text-gray-400 mb-4">
            粘贴你的原创小说片段，系统将自动分析并学习你的写作风格
          </p>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="粘贴你的原创小说片段（建议200字以上）..."
            rows={6}
            className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
          />

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !newContent.trim()}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50 transition"
          >
            {analyzing ? '分析中...' : '✨ 深度分析文风'}
          </button>
        </section>

        {/* 当前文风 */}
        {book.style && (
          <section className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">当前锁定文风</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-gray-400">句式偏好</div>
                <div className="text-lg font-medium mt-1">{book.style.sentenceLength}</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-gray-400">短句比例</div>
                <div className="text-lg font-medium mt-1">{(book.style.shortSentence * 100).toFixed(0)}%</div>
              </div>
              <div className="col-span-2 p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">语气特征</div>
                <div className="flex flex-wrap gap-2">
                  {book.style.tone?.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/30 rounded text-sm">{t}</span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">常用连接词</div>
                <div className="flex flex-wrap gap-2">
                  {book.style.connectors?.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/30 rounded text-sm">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 文风分析说明 */}
        <section className="bg-slate-800/50 rounded-xl p-4 text-sm text-gray-400">
          <h3 className="font-medium text-white mb-2">文风学习说明</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>粘贴越多原创内容，分析越准确</li>
            <li>分析内容包括：句式长短、连接词、语气词、标点习惯等</li>
            <li>应用文风后，AI创作将自动贴合你的写作风格</li>
            <li>支持添加多个样本，随时可以切换</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
