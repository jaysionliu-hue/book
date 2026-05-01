import React, { useState } from 'react';
import { Book, Chapter, CHAPTER_AGENT } from '../../utils/types';

interface ChaptersProps {
  book: Book;
  onUpdate: (data: Partial<Book>) => void;
  settings?: any;
}

export default function Chapters({ book, onUpdate, settings }: ChaptersProps) {
  const [selectedChapter, setSelectedChapter] = useState<number>(book.currentChapter || 1);
  const [editingContent, setEditingContent] = useState('');
  const [generating, setGenerating] = useState(false);

  const chapters = book.chapters || [];
  const currentChapter = chapters.find((c) => c.number === selectedChapter);

  // 加载章节内容
  React.useEffect(() => {
    if (currentChapter) {
      setEditingContent(currentChapter.content);
    }
  }, [selectedChapter]);

  // 保存章节
  const handleSave = () => {
    const wordCount = editingContent.replace(/\s/g, '').length;
    const updatedChapters = chapters.map((c) =>
      c.number === selectedChapter
        ? { ...c, content: editingContent, wordCount, updatedAt: Date.now() }
        : c
    );
    onUpdate({
      chapters: updatedChapters,
      totalWordCount: updatedChapters.reduce((sum, c) => sum + c.wordCount, 0),
    });
  };

  // 新建章节
  const handleNewChapter = () => {
    const newNumber = (chapters.length > 0 ? Math.max(...chapters.map((c) => c.number)) : 0) + 1;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      number: newNumber,
      title: `第${newNumber}章`,
      content: '',
      wordCount: 0,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onUpdate({
      chapters: [...chapters, newChapter],
      currentChapter: newNumber,
    });
    setSelectedChapter(newNumber);
  };

  // AI续写
  const handleGenerate = async () => {
    if (!settings?.apiKey) {
      alert('请先在设置中配置DeepSeek API');
      return;
    }

    setGenerating(true);

    try {
      const previousContent = currentChapter?.content || '';
      const generated = await window.api.ai.chat({
        systemPrompt: CHAPTER_AGENT.systemPrompt,
        userPrompt: CHAPTER_AGENT.generatePrompt(book, selectedChapter, previousContent, book.style),
      });

      setEditingContent(generated);
      const wordCount = generated.replace(/\s/g, '').length;

      const updatedChapters = chapters.map((c) =>
        c.number === selectedChapter
          ? { ...c, content: generated, wordCount, status: 'draft' as const, updatedAt: Date.now() }
          : c
      );

      onUpdate({
        chapters: updatedChapters,
        totalWordCount: updatedChapters.reduce((sum, c) => sum + c.wordCount, 0),
      });
    } catch (error: any) {
      alert('生成失败: ' + (error.message || '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  // 字数统计
  const wordCount = editingContent.replace(/\s/g, '').length;
  const targetWordCount = 2000;
  const progress = Math.min((wordCount / targetWordCount) * 100, 100);

  return (
    <div className="flex gap-6 h-full">
      {/* 章节列表 */}
      <div className="w-64 bg-slate-800 rounded-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">章节列表</h2>
          <button
            onClick={handleNewChapter}
            className="text-blue-400 hover:text-blue-300 text-xl"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter.number)}
              className={`w-full p-3 rounded-lg text-left transition ${
                selectedChapter === chapter.number
                  ? 'bg-blue-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <div className="font-medium">{chapter.title}</div>
              <div className="text-xs text-gray-400 mt-1">
                {chapter.wordCount}字 · {chapter.status === 'completed' ? '已完成' : '草稿'}
              </div>
            </button>
          ))}

          {chapters.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>暂无章节</p>
              <button
                onClick={handleNewChapter}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                创建第一章
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl p-4">
        {currentChapter ? (
          <>
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={currentChapter.title}
                  onChange={(e) => {
                    const updatedChapters = chapters.map((c) =>
                      c.number === selectedChapter ? { ...c, title: e.target.value } : c
                    );
                    onUpdate({ chapters: updatedChapters });
                  }}
                  className="text-xl font-semibold bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm disabled:opacity-50 transition"
                >
                  {generating ? '生成中...' : '✨ AI续写'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
                >
                  保存
                </button>
              </div>
            </div>

            {/* 字数进度 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>字数：{wordCount}</span>
                <span>目标：{targetWordCount}字</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition ${
                    progress >= 100 ? 'bg-green-500' : progress >= 80 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 编辑区 */}
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="开始创作..."
              className="flex-1 w-full p-4 bg-slate-700/50 rounded-lg resize-none focus:outline-none leading-relaxed"
              style={{ lineHeight: '1.8' }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">暂无选中章节</p>
              <button
                onClick={handleNewChapter}
                className="text-blue-400 hover:text-blue-300"
              >
                创建第一章
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
