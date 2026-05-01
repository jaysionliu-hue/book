import React, { useState, useEffect } from 'react';
import { Book, Settings, Genre, GENRE_TEMPLATES, WORLDVIEW_AGENT, CHARACTER_AGENT, PLOT_AGENT } from '../utils/types';
import { v4 as uuid } from 'uuid';

interface CreateBookModalProps {
  onClose: () => void;
  onCreate: (book: Book) => void;
  settings: Settings | null;
}

type Step = 'channel' | 'genre' | 'tags' | 'info' | 'generating' | 'complete';

const CHANNEL_TAGS = {
  female: ['豪门', '甜宠', '虐恋', '重生', '穿越', '复仇', '修仙', '都市', '古言', '悬疑'],
  male: ['玄幻', '都市', '穿越', '系统', '无敌', '修仙', '游戏', '科幻', '武侠', '异能'],
};

export default function CreateBookModal({ onClose, onCreate, settings }: CreateBookModalProps) {
  const [step, setStep] = useState<Step>('channel');
  const [channel, setChannel] = useState<'female' | 'male'>('female');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [newGenreName, setNewGenreName] = useState('');
  const [showNewGenre, setShowNewGenre] = useState(false);

  const genres = GENRE_TEMPLATES[channel];

  // 获取当前分类下的题材
  const getCurrentGenres = () => {
    const categoryKeys = Object.keys(genres) as (keyof typeof genres)[];
    const allGenres: { id: string; name: string }[] = [];
    categoryKeys.forEach((cat) => {
      const catGenres = genres[cat]?.templates || [];
      catGenres.forEach((g: string) => {
        allGenres.push({ id: g, name: g });
      });
    });
    return allGenres;
  };

  // 步骤导航
  const canProceed = () => {
    switch (step) {
      case 'channel': return !!channel;
      case 'genre': return !!selectedGenre;
      case 'tags': return selectedTags.length > 0;
      case 'info': return bookTitle.trim().length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (!canProceed()) return;
    
    const steps: Step[] = ['channel', 'genre', 'tags', 'info'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['channel', 'genre', 'tags', 'info'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      setStep('channel');
    }
  };

  // 创建书籍并生成设定
  const handleCreate = async () => {
    if (!bookTitle.trim()) return;

    setStep('generating');
    setGenerating(true);

    try {
      // 创建书籍基础数据
      const book: Book = {
        id: uuid(),
        title: bookTitle.trim(),
        genreId: selectedGenre,
        genreName: selectedGenre,
        channel,
        tags: selectedTags,
        synopsis: bookSynopsis,
        coreSetting: {
          theme: '',
          oneLineSummary: bookSynopsis || '',
          genreType: selectedGenre,
          eraBackground: '',
          faceSlappingLines: [],
          romanceLines: [],
          careerLines: [],
          geographySociety: '',
          worldRules: '',
          writingStyle: '',
          tone: '',
          titleDesign: bookTitle,
        },
        characters: [],
        storyStructure: {
          act1: '',
          act2: '',
          act3: '',
          chapters: [],
        },
        writingRules: {
          perspective: '第三人称有限视角',
          sceneFormat: '场景切片化',
          paragraphLimit: 80,
          sensoryFocus: [],
          symbols: [],
          forbidden: [],
        },
        settings: {
          worldView: '',
          factions: [],
          rules: [],
          geography: [],
          props: [],
          timeline: [],
        },
        plotPoints: [],
        chapters: [],
        currentChapter: 1,
        totalWordCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setProgress('正在生成世界观设定...');
      
      // 生成世界观
      if (settings?.apiKey) {
        try {
          const worldview = await window.api.ai.chat({
            systemPrompt: WORLDVIEW_AGENT.systemPrompt,
            userPrompt: WORLDVIEW_AGENT.generatePrompt(channel, selectedGenre, selectedTags),
          });
          book.settings.worldView = worldview;
          setProgress('正在生成人物设定...');
        } catch (e) {
          console.error('世界观生成失败:', e);
        }
      }

      // 生成人物
      if (settings?.apiKey) {
        try {
          const characters = await window.api.ai.chat({
            systemPrompt: CHARACTER_AGENT.systemPrompt,
            userPrompt: CHARACTER_AGENT.generatePrompt(selectedGenre, book.coreSetting.theme, []),
          });
          book.characters = JSON.parse(characters);
          setProgress('正在生成剧情大纲...');
        } catch (e) {
          console.error('人物生成失败:', e);
        }
      }

      // 生成剧情大纲
      if (settings?.apiKey) {
        try {
          const plot = await window.api.ai.chat({
            systemPrompt: PLOT_AGENT.systemPrompt,
            userPrompt: PLOT_AGENT.generatePrompt(book.coreSetting.theme, book.characters, 50),
          });
          book.storyStructure.act1 = plot;
          setProgress('创建完成！');
        } catch (e) {
          console.error('剧情生成失败:', e);
        }
      }

      setStep('complete');
      setTimeout(() => {
        onCreate(book);
      }, 1000);

    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
      setStep('info');
    } finally {
      setGenerating(false);
    }
  };

  // 渲染步骤内容
  const renderStep = () => {
    switch (step) {
      case 'channel':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">选择频道</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setChannel('female'); setSelectedGenre(''); }}
                className={`p-6 rounded-xl border-2 transition ${
                  channel === 'female'
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-slate-600 hover:border-pink-400'
                }`}
              >
                <div className="text-3xl mb-2">👩</div>
                <div className="font-semibold">女频</div>
                <div className="text-sm text-gray-400">甜宠/虐恋/穿越/修仙</div>
              </button>
              <button
                onClick={() => { setChannel('male'); setSelectedGenre(''); }}
                className={`p-6 rounded-xl border-2 transition ${
                  channel === 'male'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 hover:border-blue-400'
                }`}
              >
                <div className="text-3xl mb-2">👨</div>
                <div className="font-semibold">男频</div>
                <div className="text-sm text-gray-400">玄幻/都市/游戏/科幻</div>
              </button>
            </div>
          </div>
        );

      case 'genre':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">选择题材</h2>
            <div className="grid grid-cols-3 gap-3">
              {getCurrentGenres().map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.name)}
                  className={`p-4 rounded-lg border transition ${
                    selectedGenre === genre.name
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-blue-400'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewGenre(true)}
              className="w-full p-3 border border-dashed border-slate-500 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-400 transition"
            >
              + 自定义题材
            </button>
            
            {showNewGenre && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="输入新题材名称"
                  className="flex-1 p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={() => {
                    if (newGenreName.trim()) {
                      setSelectedGenre(newGenreName.trim());
                      setShowNewGenre(false);
                      setNewGenreName('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 rounded-lg"
                >
                  添加
                </button>
              </div>
            )}
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">选择标签（最多5个）</h2>
            <div className="grid grid-cols-3 gap-3">
              {CHANNEL_TAGS[channel].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : prev.length < 5 ? [...prev, tag] : prev
                    );
                  }}
                  className={`p-3 rounded-lg border transition ${
                    selectedTags.includes(tag)
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-slate-600 hover:border-green-400'
                  }`}
                >
                  {tag}
                  {selectedTags.includes(tag) && <span className="ml-1 text-green-400">✓</span>}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 text-center">
              已选择 {selectedTags.length}/5 个标签
            </p>
          </div>
        );

      case 'info':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">填写信息</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">书名 *</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="请输入书名"
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">简介</label>
              <textarea
                value={bookSynopsis}
                onChange={(e) => setBookSynopsis(e.target.value)}
                placeholder="请输入一句话简介（50字内）"
                rows={3}
                className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">确认信息</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-500/30 rounded text-sm">
                  频道：{channel === 'female' ? '女频' : '男频'}
                </span>
                <span className="px-2 py-1 bg-green-500/30 rounded text-sm">
                  题材：{selectedGenre}
                </span>
                {selectedTags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-purple-500/30 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="space-y-4 text-center py-8">
            <div className="text-5xl animate-pulse">⚡</div>
            <h2 className="text-xl font-semibold">AI正在生成设定...</h2>
            <p className="text-gray-400">{progress}</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center py-8">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-semibold">创建成功！</h2>
            <p className="text-gray-400">正在跳转到创作界面...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">创建新作品</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* 步骤进度 */}
        {step !== 'generating' && step !== 'complete' && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              {['频道', '题材', '标签', '信息'].map((label, index) => {
                const steps: Step[] = ['channel', 'genre', 'tags', 'info'];
                const currentIndex = steps.indexOf(step);
                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          index <= currentIndex
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`ml-2 text-sm ${index <= currentIndex ? 'text-white' : 'text-gray-400'}`}>
                        {label}
                      </span>
                    </div>
                    {index < 3 && <div className="flex-1 h-0.5 bg-slate-700 mx-4" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* 内容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* 底部按钮 */}
        {step !== 'generating' && step !== 'complete' && (
          <div className="p-4 border-t border-slate-700 flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 'channel'}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              上一步
            </button>
            {step === 'info' ? (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || generating}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {generating ? '生成中...' : '创建并生成设定'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                下一步
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
