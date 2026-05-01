import React, { useState } from 'react';
import { Book, WorldSetting } from '../../utils/types';

interface WorldProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
}

export default function World({ book, onUpdate }: WorldProps) {
  const [activeTab, setActiveTab] = useState<keyof WorldSetting>('worldview');
  const [editing, setEditing] = useState<WorldSetting>(book.coreSetting || {
    worldview: '',
    socialStructure: '',
    rules: '',
    geography: '',
    timeline: '',
    items: [],
    factions: [],
  });

  const tabs = [
    { id: 'worldview', label: '世界观', placeholder: '核心世界观设定、异能规则、法则等' },
    { id: 'socialStructure', label: '社会结构', placeholder: '势力分布、等级体系、组织架构等' },
    { id: 'rules', label: '规则设定', placeholder: '特殊规则、法则、限制条件等' },
    { id: 'geography', label: '地理环境', placeholder: '主要场景、地点、环境特征等' },
    { id: 'timeline', label: '时间线', placeholder: '重要事件时间线、关键节点等' },
    { id: 'items', label: '道具宝物', placeholder: '重要物品、法宝、道具等' },
    { id: 'factions', label: '势力分布', placeholder: '主要势力、派系、组织等' },
  ];

  const handleSave = () => {
    onUpdate({ coreSetting: editing });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">全书设定库</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
        >
          保存设定
        </button>
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-blue-500'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 编辑区 */}
      <div className="bg-slate-800 rounded-xl p-6 min-h-[400px]">
        <textarea
          value={(editing as any)[activeTab] as string || ''}
          onChange={(e) => setEditing({ ...editing, [activeTab]: e.target.value })}
          placeholder={tabs.find((t) => t.id === activeTab)?.placeholder}
          className="w-full h-full min-h-[350px] p-4 bg-slate-700/50 rounded-lg resize-none focus:outline-none leading-relaxed"
        />
      </div>

      {/* 设定预览 */}
      {book.coreSetting && (
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">设定概览</h2>
          <div className="space-y-4">
            {tabs.map((tab) => {
              const value = (book.coreSetting as any)[tab.id];
              if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
              return (
                <div key={tab.id} className="p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">{tab.label}</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
