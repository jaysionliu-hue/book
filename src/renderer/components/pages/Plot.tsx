import React, { useState } from 'react';
import { Book, PlotPoint } from '../../utils/types';

interface PlotProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
}

export default function Plot({ book, onUpdate }: PlotProps) {
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);

  const plotPoints = book.plotPoints || [];

  // 添加伏笔
  const handleAdd = () => {
    const newPlot: PlotPoint = {
      id: Date.now().toString(),
      type: 'foreshadow',
      content: '',
      chapter: book.currentChapter || 1,
      status: 'active',
      createdAt: Date.now(),
    };
    onUpdate({ plotPoints: [...plotPoints, newPlot] });
    setSelectedPlot(newPlot.id);
  };

  // 更新伏笔
  const handleUpdate = (id: string, updates: Partial<PlotPoint>) => {
    const updated = plotPoints.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    onUpdate({ plotPoints: updated });
  };

  // 删除伏笔
  const handleDelete = (id: string) => {
    const updated = plotPoints.filter((p) => p.id !== id);
    onUpdate({ plotPoints: updated });
    setSelectedPlot(null);
  };

  // 标记完成
  const handleComplete = (id: string) => {
    handleUpdate(id, { status: 'completed' });
  };

  const groupedPlots = {
    foreshadow: plotPoints.filter((p) => p.type === 'foreshadow'),
    conflict: plotPoints.filter((p) => p.type === 'conflict'),
    twist: plotPoints.filter((p) => p.type === 'twist'),
  };

  const selected = plotPoints.find((p) => p.id === selectedPlot);

  return (
    <div className="flex gap-6 h-full">
      {/* 伏笔列表 */}
      <div className="w-72 bg-slate-800 rounded-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">剧情控制台</h2>
          <button onClick={handleAdd} className="text-blue-400 hover:text-blue-300 text-xl">
            +
          </button>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="p-2 bg-slate-700/50 rounded text-center">
            <div className="text-lg font-bold text-green-400">{plotPoints.filter((p) => p.status === 'completed').length}</div>
            <div className="text-gray-400">已完成</div>
          </div>
          <div className="p-2 bg-slate-700/50 rounded text-center">
            <div className="text-lg font-bold text-orange-400">{plotPoints.filter((p) => p.status === 'active').length}</div>
            <div className="text-gray-400">进行中</div>
          </div>
        </div>

        {/* 类型分组 */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs text-gray-400 uppercase mb-2">伏笔 ({groupedPlots.foreshadow.length})</h3>
            <div className="space-y-1">
              {groupedPlots.foreshadow.map((plot) => (
                <button
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot.id)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition ${
                    selectedPlot === plot.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                  } ${plot.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="truncate">{plot.content || '未填写内容'}</div>
                  <div className="text-xs text-gray-400 mt-1">第{plot.chapter}章</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs text-gray-400 uppercase mb-2">冲突 ({groupedPlots.conflict.length})</h3>
            <div className="space-y-1">
              {groupedPlots.conflict.map((plot) => (
                <button
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot.id)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition ${
                    selectedPlot === plot.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                  } ${plot.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="truncate">{plot.content || '未填写内容'}</div>
                  <div className="text-xs text-gray-400 mt-1">第{plot.chapter}章</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs text-gray-400 uppercase mb-2">反转 ({groupedPlots.twist.length})</h3>
            <div className="space-y-1">
              {groupedPlots.twist.map((plot) => (
                <button
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot.id)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition ${
                    selectedPlot === plot.id ? 'bg-blue-500' : 'hover:bg-slate-700'
                  } ${plot.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="truncate">{plot.content || '未填写内容'}</div>
                  <div className="text-xs text-gray-400 mt-1">第{plot.chapter}章</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 伏笔详情 */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 overflow-y-auto">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select
                value={selected.type}
                onChange={(e) => handleUpdate(selected.id, { type: e.target.value as any })}
                className="p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="foreshadow">伏笔</option>
                <option value="conflict">冲突</option>
                <option value="twist">反转</option>
              </select>

              <div className="flex gap-2">
                {selected.status === 'active' && (
                  <button
                    onClick={() => handleComplete(selected.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition"
                  >
                    ✓ 标记完成
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
                >
                  删除
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">出现章节</label>
                <input
                  type="number"
                  min={1}
                  value={selected.chapter}
                  onChange={(e) => handleUpdate(selected.id, { chapter: parseInt(e.target.value) })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">状态</label>
                <div className={`mt-3 px-3 py-1 rounded-full text-sm inline-block ${
                  selected.status === 'completed'
                    ? 'bg-green-500/30 text-green-400'
                    : 'bg-orange-500/30 text-orange-400'
                }`}>
                  {selected.status === 'completed' ? '已完成' : '进行中'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">内容</label>
              <textarea
                value={selected.content}
                onChange={(e) => handleUpdate(selected.id, { content: e.target.value })}
                placeholder="描述这个伏笔/冲突/反转的内容..."
                rows={4}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none mt-1 resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">回收章节</label>
              <input
                type="number"
                min={1}
                value={selected.resolvedChapter || ''}
                onChange={(e) => handleUpdate(selected.id, { resolvedChapter: parseInt(e.target.value) })}
                placeholder="填写回收章节"
                className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">备注</label>
              <textarea
                value={selected.note || ''}
                onChange={(e) => handleUpdate(selected.id, { note: e.target.value })}
                placeholder="补充说明..."
                rows={2}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none mt-1 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">选择或添加伏笔</p>
              <button onClick={handleAdd} className="text-blue-400 hover:text-blue-300">
                + 添加伏笔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
