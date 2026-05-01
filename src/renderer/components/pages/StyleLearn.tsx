import React, { useState } from 'react';
import { Book } from '../utils/types';

interface Props {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
}

const StyleLearn: React.FC<Props> = ({ book, onUpdate }) => {
  const [sampleText, setSampleText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeStyle = () => {
    if (!sampleText.trim()) {
      alert('请输入文风样本');
      return;
    }
    setAnalyzing(true);
    
    // 模拟AI分析
    setTimeout(() => {
      const result = analyzeText(sampleText);
      setAnalysisResult(result);
      setAnalyzing(false);
    }, 1000);
  };

  const analyzeText = (text: string): any => {
    // 基础统计
    const sentences = text.split(/[。！？]/).filter(s => s.trim());
    const avgSentenceLength = text.length / sentences.length;
    
    // 短句比例（少于10字的句子）
    const shortSentences = sentences.filter(s => s.trim().length < 10);
    const shortRatio = (shortSentences.length / sentences.length * 100).toFixed(1);
    
    // 连接词统计
    const connectors = ['然后', '于是', '但是', '不过', '因为', '所以', '如果', '虽然', '然而', '而且', '甚至', '只是', '已经', '终于', '忽然', '突然', '一下子'];
    const connectorCounts: Record<string, number> = {};
    connectors.forEach(c => {
      const count = (text.match(new RegExp(c, 'g')) || []).length;
      if (count > 0) connectorCounts[c] = count;
    });
    
    // 语气词统计
    const particles = ['啊', '呢', '吧', '呀', '嘛', '哦', '嗯', '哈', '呵', '噢'];
    const particleCounts: Record<string, number> = {};
    particles.forEach(p => {
      const count = (text.match(new RegExp(p, 'g')) || []).length;
      if (count > 0) particleCounts[p] = count;
    });
    
    // 描写词汇
    const descriptiveWords = text.match(/[的地得着过了]/g) || [];
    
    return {
      totalChars: text.length,
      sentenceCount: sentences.length,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      shortRatio,
      topConnectors: Object.entries(connectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topParticles: Object.entries(particleCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      descriptiveRatio: ((descriptiveWords.length / text.length) * 100).toFixed(1),
      suggestions: generateSuggestions({ avgSentenceLength, shortRatio, descriptiveRatio: ((descriptiveWords.length / text.length) * 100).toFixed(1) })
    };
  };

  const generateSuggestions = (stats: any): string[] => {
    const suggestions: string[] = [];
    if (parseFloat(stats.avgSentenceLength) > 20) {
      suggestions.push('句式偏长，可适当拆分短句增强节奏感');
    }
    if (parseFloat(stats.shortRatio) < 20) {
      suggestions.push('短句比例偏低，增加短句可提升阅读节奏');
    }
    if (parseFloat(stats.descriptiveRatio) > 15) {
      suggestions.push('描写词密度较高，可适度精简');
    }
    suggestions.push('建议在写作时保持这种叙事节奏');
    return suggestions;
  };

  const saveToStyle = () => {
    if (!analysisResult) return;
    onUpdate({
      styleProfile: {
        ...book.styleProfile,
        samples: [...(book.styleProfile?.samples || []), sampleText],
        lastUpdated: Date.now()
      }
    });
    alert('文风已保存');
  };

  const clearStyle = () => {
    if (!confirm('确定清除所有文风样本吗？')) return;
    onUpdate({
      styleProfile: {
        samples: [],
        lastUpdated: Date.now()
      }
    });
    setSampleText('');
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">文风学习</h2>
      
      {/* 文风样本输入 */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">粘贴文风样本</h3>
          <span className="text-sm text-gray-400">
            已保存 {(book.styleProfile?.samples || []).length} 个样本
          </span>
        </div>
        <textarea
          value={sampleText}
          onChange={e => setSampleText(e.target.value)}
          placeholder="粘贴你的原创章节、片段或稿件，系统将自动深度拆解你的用词、语感、句式、叙事节奏、描写习惯、对话风格..."
          className="w-full h-48 bg-slate-700 rounded p-4 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={analyzeStyle}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded transition"
          >
            {analyzing ? '分析中...' : '分析文风'}
          </button>
          <button
            onClick={saveToStyle}
            disabled={!analysisResult}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded transition"
          >
            保存样本
          </button>
          <button
            onClick={clearStyle}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition"
          >
            清除全部
          </button>
        </div>
      </div>

      {/* 分析结果 */}
      {analysisResult && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">文风分析报告</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{analysisResult.totalChars}</div>
              <div className="text-sm text-gray-400">总字数</div>
            </div>
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{analysisResult.sentenceCount}</div>
              <div className="text-sm text-gray-400">句子数</div>
            </div>
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{analysisResult.avgSentenceLength}</div>
              <div className="text-sm text-gray-400">平均句长</div>
            </div>
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{analysisResult.shortRatio}%</div>
              <div className="text-sm text-gray-400">短句比例</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-400">高频连接词</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.topConnectors.map(([word, count]: [string, number]) => (
                  <span key={word} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-400">语气词</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.topParticles.map(([word, count]: [string, number]) => (
                  <span key={word} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-sm">
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-400">写作建议</h4>
            <ul className="space-y-1">
              {analysisResult.suggestions.map((s: string, i: number) => (
                <li key={i} className="text-sm text-orange-300 flex items-start gap-2">
                  <span>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 已保存样本列表 */}
      {(book.styleProfile?.samples || []).length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">已保存样本</h3>
          <div className="space-y-2">
            {(book.styleProfile?.samples || []).map((sample, idx) => (
              <div key={idx} className="bg-slate-700 rounded p-2 text-sm text-gray-300">
                样本 {idx + 1}：{sample.slice(0, 100)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文风使用说明 */}
      <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-gray-400">
        <h4 className="font-semibold text-gray-300 mb-2">使用说明</h4>
        <ul className="space-y-1">
          <li>• 粘贴你最满意的原创作品片段进行分析</li>
          <li>• 分析结果将记录你的写作特征，包括句式、词汇、节奏等</li>
          <li>• 保存多个样本可以获得更准确的文风画像</li>
          <li>• AI生成内容时会参考你的文风特征进行创作</li>
        </ul>
      </div>
    </div>
  );
};

export default StyleLearn;
