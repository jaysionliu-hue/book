import React, { useState, useEffect } from 'react';
import { Book, PlotLine, UnresolvedPlot } from '../utils/types';

interface Props {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
  settings: any;
}

const PlotControl: React.FC<Props> = ({ book, onUpdate, settings }) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'plotlines' | 'foreshadowing'>('outline');
  const [newChapter, setNewChapter] = useState('');
  const [newPlotPoint, setNewPlotPoint] = useState('');
  const [newForeshadow, setNewForeshadow] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!book.plotLines) onUpdate({ plotLines: [] });
    if (!book.unresolvedPlots) onUpdate({ unresolvedPlots: [] });
    if (!book.acts) onUpdate({ acts: {
      act1: { name: '开端', chapters: [], description: '建立日常世界，引入激励事件' },
      act2: { name: '对抗', chapters: [], description: '主角面对障碍，持续升级冲突' },
      act3: { name: '结局', chapters: [], description: '高潮对决，解决问题' }
    }});
  }, []);

  const updatePlotLines = (plotLines: PlotLine[]) => {
    onUpdate({ plotLines });
  };

  const updateUnresolvedPlots = (unresolvedPlots: UnresolvedPlot[]) => {
    onUpdate({ unresolvedPlots });
  };

  const addPlotPoint = () => {
    if (!newPlotPoint.trim()) return;
    const plotLines = book.plotLines || [];
    if (plotLines.length === 0) {
      updatePlotLines([{
        id: `plot-${Date.now()}`,
        name: '主线',
        points: [{ id: `point-${Date.now()}`, title: newPlotPoint, chapter: book.currentChapter || 1, status: 'pending' as const }]
      }]);
    } else {
      const updated = plotLines.map((p, i) => 
        i === 0 ? { ...p, points: [...p.points, { id: `point-${Date.now()}`, title: newPlotPoint, chapter: book.currentChapter || 1, status: 'pending' as const }] } : p
      );
      updatePlotLines(updated);
    }
    setNewPlotPoint('');
  };

  const addForeshadow = () => {
    if (!newForeshadow.trim()) return;
    const unresolvedPlots = book.unresolvedPlots || [];
    updateUnresolvedPlots([...unresolvedPlots, {
      id: `foreshadow-${Date.now()}`,
      description: newForeshadow,
      chapter: book.currentChapter || 1,
      status: 'pending' as const
    }]);
    setNewForeshadow('');
  };

  const markPlotResolved = (id: string) => {
    const unresolvedPlots = book.unresolvedPlots || [];
    updateUnresolvedPlots(unresolvedPlots.map(p => 
      p.id === id ? { ...p, status: 'resolved' as const } : p
    ));
  };

  const addChapterToAct = (act: 'act1' | 'act2' | 'act3') => {
    if (!newChapter.trim()) return;
    const acts = book.acts || {
      act1: { name: '开端', chapters: [], description: '' },
      act2: { name: '对抗', chapters: [], description: '' },
      act3: { name: '结局', chapters: [], description: '' }
    };
    const chapterNum = parseInt(newChapter) || (book.currentChapter || 1);
    if (!acts[act].chapters.includes(chapterNum)) {
      acts[act].chapters = [...acts[act].chapters, chapterNum].sort((a, b) => a - b);
      onUpdate({ acts });
    }
    setNewChapter('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">剧情进度控制台</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('outline')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'outline' ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            三幕结构
          </button>
          <button
            onClick={() => setActiveTab('plotlines')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'plotlines' ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            剧情线
          </button>
          <button
            onClick={() => setActiveTab('foreshadowing')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'foreshadowing' ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            伏笔追踪
          </button>
        </div>
      </div>

      {/* 三幕结构 */}
      {activeTab === 'outline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(book.acts ? Object.entries(book.acts) : []).map(([key, act]: [string, any]) => (
              <div key={key} className="bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{act.name}</h3>
                  <span className="text-sm text-gray-400">{act.chapters?.length || 0}章</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{act.description}</p>
                <div className="space-y-1 mb-3">
                  {act.chapters?.map((ch: number) => (
                    <div key={ch} className="text-sm bg-slate-700 px-2 py-1 rounded">
                      第{ch}章
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    placeholder="章号"
                    className="flex-1 bg-slate-700 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => addChapterToAct(key as 'act1' | 'act2' | 'act3')}
                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    添加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 剧情线 */}
      {activeTab === 'plotlines' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlotPoint}
              onChange={e => setNewPlotPoint(e.target.value)}
              placeholder="添加剧情节点..."
              className="flex-1 bg-slate-700 rounded px-4 py-2"
              onKeyDown={e => e.key === 'Enter' && addPlotPoint()}
            />
            <button onClick={addPlotPoint} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
              添加节点
            </button>
          </div>
          <div className="space-y-3">
            {(book.plotLines || []).map((plotLine: PlotLine) => (
              <div key={plotLine.id} className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{plotLine.name}</h3>
                <div className="space-y-2">
                  {plotLine.points.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(point.status)}`}></span>
                      <span className="text-gray-400 w-12">第{point.chapter}章</span>
                      <span className="flex-1">{point.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        point.status === 'completed' ? 'bg-green-500/20 text-green-300' : 
                        point.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {point.status === 'completed' ? '已完成' : point.status === 'in-progress' ? '进行中' : '待完成'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 伏笔追踪 */}
      {activeTab === 'foreshadowing' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newForeshadow}
              onChange={e => setNewForeshadow(e.target.value)}
              placeholder="记录伏笔..."
              className="flex-1 bg-slate-700 rounded px-4 py-2"
              onKeyDown={e => e.key === 'Enter' && addForeshadow()}
            />
            <button onClick={addForeshadow} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded">
              添加伏笔
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-orange-400">未回收伏笔</h3>
              <div className="space-y-2">
                {(book.unresolvedPlots || []).filter(p => p.status === 'pending').map(foreshadow => (
                  <div key={foreshadow.id} className="bg-slate-800 rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm text-gray-400">第{foreshadow.chapter}章</span>
                      <button
                        onClick={() => markPlotResolved(foreshadow.id)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        标记已回收
                      </button>
                    </div>
                    <p className="text-sm">{foreshadow.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-400">已回收伏笔</h3>
              <div className="space-y-2">
                {(book.unresolvedPlots || []).filter(p => p.status === 'resolved').map(foreshadow => (
                  <div key={foreshadow.id} className="bg-slate-800/50 rounded p-3 opacity-60">
                    <span className="text-sm text-gray-400">第{foreshadow.chapter}章</span>
                    <p className="text-sm">{foreshadow.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 上下文缓存 */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">上一章上下文</h3>
        <textarea
          value={book.lastChapterContext || ''}
          onChange={e => onUpdate({ lastChapterContext: e.target.value })}
          placeholder="记录上一章的关键情节、人物状态、情绪氛围，确保续写无缝衔接..."
          className="w-full h-32 bg-slate-700 rounded p-3 text-sm resize-none"
        />
      </div>
    </div>
  );
};

export default PlotControl;
