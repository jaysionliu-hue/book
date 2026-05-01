import React, { useState, useEffect } from 'react';
import { Settings } from '../../utils/types';

interface SettingsPageProps {
  onSave: (settings: Settings) => void;
}

export default function SettingsPage({ onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    apiUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saved, setSaved] = useState(false);

  // 加载设置
  useEffect(() => {
    window.api.settings.get().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  // 保存设置
  const handleSave = async () => {
    await window.api.settings.save(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave(settings);
  };

  // 测试连接
  const handleTest = async () => {
    if (!settings.apiKey) {
      setTestResult('error');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${settings.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* DeepSeek API配置 */}
      <section className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">DeepSeek API 配置</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key *</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              从 <a href="https://platform.deepseek.com" target="_blank" className="text-blue-400 hover:underline">platform.deepseek.com</a> 获取 API Key
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">API 地址</label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
              placeholder="https://api.deepseek.com"
              className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">模型</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-coder">deepseek-coder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">温度 (Temperature)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">控制随机性，0-2之间</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">最大生成 Tokens</label>
            <input
              type="number"
              min="100"
              max="4000"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTest}
              disabled={testing || !settings.apiKey}
              className={`px-6 py-2 rounded-lg transition ${
                testResult === 'success'
                  ? 'bg-green-500'
                  : testResult === 'error'
                  ? 'bg-red-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              {testing ? '测试中...' : testResult === 'success' ? '✓ 连接成功' : testResult === 'error' ? '✗ 连接失败' : '测试连接'}
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>
        </div>
      </section>

      {/* 题材管理 */}
      <section className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">题材模板管理</h2>
        <p className="text-gray-400 text-sm mb-4">
          管理创作时可选择的题材分类模板
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-medium mb-2">女频题材</h3>
              <p className="text-sm text-gray-400">豪门总裁 | 甜宠 | 虐恋 | 重生 | 穿越 | 复仇 | 修仙 | 都市 | 古言 | 悬疑</p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-medium mb-2">男频题材</h3>
              <p className="text-sm text-gray-400">玄幻 | 都市 | 穿越 | 系统 | 无敌 | 修仙 | 游戏 | 科幻 | 武侠 | 异能</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            题材分类在创建书籍时选择，支持自定义添加新题材
          </p>
        </div>
      </section>

      {/* 关于 */}
      <section className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">关于</h2>
        <div className="space-y-2 text-gray-400">
          <p>网文创作工作室 v1.0.0</p>
          <p className="text-sm">基于DeepSeek API的智能网文创作助手</p>
          <p className="text-sm">支持人物设定、世界观生成、剧情大纲、章节续写等功能</p>
        </div>
      </section>
    </div>
  );
}
