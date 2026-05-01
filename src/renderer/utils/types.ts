// 全局类型定义

// API设置
export interface ApiSettings {
  provider: 'deepseek' | 'openai' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// Agent常量
export const DIALOGUE_AGENT = 'dialogue';
export const DESCRIPTION_AGENT = 'description';
export const CONFLICT_AGENT = 'conflict';
export const CHARACTER_AGENT = 'character';
export const CHAPTER_AGENT = 'chapter';
export const WORLD_AGENT = 'world';
export const WORLDVIEW_AGENT = 'world';  // 别名
export const PLOT_AGENT = 'plot';
export const STYLE_ANALYSIS_AGENT = 'style';
export const STYLE_LEARN_AGENT = 'style';

export const AGENTS = {
  [DIALOGUE_AGENT]: {
    name: '对话生成Agent',
    description: '生成符合角色性格的对话',
    prompt: '你是一个专业的网文对话生成专家。'
  },
  [DESCRIPTION_AGENT]: {
    name: '环境描写Agent',
    description: '生成场景氛围描写',
    prompt: '你是一个专业的网文环境描写专家。'
  },
  [CONFLICT_AGENT]: {
    name: '冲突设计Agent',
    description: '设计剧情冲突',
    prompt: '你是一个专业的网文冲突设计专家。'
  },
  [CHARACTER_AGENT]: {
    name: '人物塑造Agent',
    description: '生成人物设定',
    prompt: '你是一个专业的网文人物塑造专家。'
  },
  [CHAPTER_AGENT]: {
    name: '章节续写Agent',
    description: '续写章节内容',
    prompt: '你是一个专业的网文章节续写专家。'
  },
  [WORLD_AGENT]: {
    name: '世界观生成Agent',
    description: '生成世界观设定',
    prompt: '你是一个专业的网文世界观设计专家。'
  },
  [PLOT_AGENT]: {
    name: '剧情大纲Agent',
    description: '生成剧情大纲',
    prompt: '你是一个专业的网文剧情大纲设计专家。'
  },
  [STYLE_ANALYSIS_AGENT]: {
    name: '文风分析Agent',
    description: '分析文风特点',
    prompt: '你是一个专业的网文文风分析专家。'
  }
};

export interface Settings {
  apiKey: string;
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface Genre {
  id: string;
  name: string;
  channel: 'female' | 'male';
  description?: string;
  tags?: string[];
  category?: string;
  writingRules?: {
    perspective?: string;
    paragraphLimit?: number;
    wordCountPerChapter?: number;
    emotionalPattern?: string[];
  };
}

export interface Character {
  id: string;
  name: string;
  type: 'protagonist' | 'supporting' | 'antagonist';
  age?: string;
  occupation?: string;
  appearance?: string;
  personality: string[];
  motivation?: string;
  fear?: string;
  background?: string;
  relationships?: string;
  arc?: string;
  secrets?: string;
  habits?: string;
  quote?: string;
}

export interface PlotPoint {
  id: string;
  title: string;
  type: 'main' | 'sub' | 'foreshadow';
  status: 'pending' | 'in_progress' | 'completed';
  chapter?: number;
  content?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  status: 'draft' | 'completed' | 'revised';
  createdAt: number;
  updatedAt: number;
}

export interface NovelStyle {
  id: string;
  name: string;
  samples: string[];
  features: {
    avgSentenceLength: number;
    shortSentenceRatio: number;
    connectors: string[];
    exclamations: string[];
    dialogueTags: string[];
    paragraphLength: number;
  };
  createdAt: number;
}

// 剧情线
export interface PlotLine {
  id: string;
  name: string;
  points: {
    id: string;
    title: string;
    chapter: number;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
}

// 未回收伏笔
export interface UnresolvedPlot {
  id: string;
  description: string;
  chapter: number;
  status: 'pending' | 'resolved';
}

// 三幕结构
export interface ActStructure {
  name: string;
  chapters: number[];
  description: string;
}

// 文风画像
export interface StyleProfile {
  samples: string[];
  lastUpdated: number;
}

export interface Book {
  id: string;
  title: string;
  genreId: string;
  genreName: string;
  channel: 'female' | 'male';
  tags: string[];
  synopsis: string;
  
  // 剧情线
  plotLines?: PlotLine[];
  unresolvedPlots?: UnresolvedPlot[];
  acts?: {
    act1: ActStructure;
    act2: ActStructure;
    act3: ActStructure;
  };
  lastChapterContext?: string;
  
  // 文风画像
  styleProfile?: StyleProfile;
  
  // 核心设定模块
  coreSetting: {
    theme: string;
    oneLineSummary: string;
    genreType: string;
    eraBackground: string;
    faceSlappingLines: string[];
    romanceLines: string[];
    careerLines: string[];
    geographySociety: string;
    worldRules: string;
    writingStyle: string;
    tone: string;
    titleDesign: string;
  };
  
  // 角色档案
  characters: Character[];
  
  // 故事架构
  storyStructure: {
    act1: string;
    act2: string;
    act3: string;
    chapters: { number: number; content: string; wordCount: number }[];
  };
  
  // 写作规范
  writingRules: {
    perspective: string;
    sceneFormat: string;
    paragraphLimit: number;
    sensoryFocus: string[];
    symbols: string[];
    forbidden: string[];
  };
  
  // 设定库
  settings: {
    worldView: string;
    factions: string[];
    rules: string[];
    geography: string[];
    props: string[];
    timeline: string[];
  };
  
  // 剧情进度
  plotPoints: PlotPoint[];
  
  // 章节
  chapters: Chapter[];
  
  // 文风
  style?: NovelStyle;
  
  // 状态
  currentChapter: number;
  totalWordCount: number;
  createdAt: number;
  updatedAt: number;
}

// DeepSeek API 调用
export async function callDeepSeek(settings: Settings, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${settings.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: settings.maxTokens || 2000,
      temperature: settings.temperature || 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API调用失败: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ============ 题材模板 ============

export const GENRE_TEMPLATES: Record<string, any> = {
  female: {
    urban: {
      name: '现代都市',
      templates: ['豪门总裁', '甜宠', '虐恋', '重生复仇', '职场'],
      plotTemplates: ['偶遇暗恋', '契约关系', '误解解开', '身世揭露', '事业爱情双丰收']
    },
    ancient: {
      name: '古言',
      templates: ['宫斗', '宅斗', '种田', '仙侠', '江湖'],
      plotTemplates: ['重生复仇', '穿越逆袭', '甜宠日常', '家族兴衰', '修仙证道']
    },
    fantasy: {
      name: '玄幻',
      templates: ['修仙', '异世', '魔法', '神兽'],
      plotTemplates: ['废柴逆袭', '学院成长', '秘境探险', '神兽养成', '位面战争']
    },
    suspense: {
      name: '悬疑',
      templates: ['推理', '惊悚', '心理', '探险'],
      plotTemplates: ['连环案件', '身世之谜', '组织阴谋', '记忆碎片', '双重人格']
    }
  },
  male: {
    urban: {
      name: '都市',
      templates: ['异能', '兵王', '神医', '首富'],
      plotTemplates: ['装逼打脸', '一路升级', '热血兄弟', '红颜知己', '称霸都市']
    },
    fantasy: {
      name: '玄幻',
      templates: ['东方玄幻', '异世大陆', '洪荒', '神话'],
      plotTemplates: ['废柴崛起', '宗门传承', '逆天改命', '诸天万界', '神魔大战']
    },
    game: {
      name: '游戏',
      templates: ['虚拟网游', '全息游戏', '游戏异界', '电竞'],
      plotTemplates: ['副本攻略', '公会争霸', '全服第一', '隐藏职业', '游戏现实融合']
    },
    scifi: {
      name: '科幻',
      templates: ['星际', '末世', '机甲', '高武'],
      plotTemplates: ['星际移民', '文明崛起', '丧尸围城', '机械革命', '时空穿梭']
    },
    martial: {
      name: '武侠',
      templates: ['传统武侠', '综武', '江湖'],
      plotTemplates: ['门派纷争', '武功秘籍', '江湖恩怨', '侠客行', '武林外传']
    }
  }
};
