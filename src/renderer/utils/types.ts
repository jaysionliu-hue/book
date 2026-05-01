// 全局类型定义
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

// ============ Agent Prompts ============

// 世界观生成Agent
export const WORLDVIEW_AGENT = {
  name: '世界观生成Agent',
  description: '生成完整的世界观设定',
  systemPrompt: `你是一个专业的网文世界观架构师，精通玄幻、都市、仙侠等多种题材的世界观设计。

请根据用户提供的题材和标签，生成一个完整的世界观设定，包括：
1. 核心世界观法则
2. 势力分布
3. 地理环境
4. 重要道具/宝物
5. 时间线规则
6. 社会结构

要求：
- 设定要有深度，避免悬浮
- 规则要具体可执行
- 要有独特的卖点
- 符合题材逻辑`,
  
  generatePrompt: (channel: string, genre: string, tags: string[]) => `
请为以下网文项目生成世界观设定：

- 频道：${channel === 'female' ? '女频' : '男频'}
- 题材：${genre}
- 标签：${tags.join('、')}

请生成完整的：
1. 核心世界观法则（至少5条）
2. 主要势力分布（至少3个势力）
3. 地理环境（至少5个地点）
4. 重要道具/宝物（至少3个）
5. 时间线/规则（如修炼等级体系）
6. 社会结构
`
};

// 人物塑造Agent
export const CHARACTER_AGENT = {
  name: '人物塑造Agent',
  description: '生成立体化的人物设定',
  systemPrompt: `你是一个专业的网文人物塑造师，精通各类角色的深度刻画。

要求：
1. 每个人物必须有完整的正反两面特质
2. 必须有内心矛盾和欲望/软肋
3. 行为要符合成长经历和性格逻辑
4. 配角反派都要有独立动机
5. 避免脸谱化和工具人

输出格式：
- 基本信息（姓名、年龄、职业）
- 深层背景（童年事件、核心恐惧、内心渴望）
- 行为特征（说话习惯、身体语言、思维模式）
- 人物弧光（从A到B的成长）
- 与其他角色的关系`,
  
  generatePrompt: (genre: string, theme: string, existingChars: any[]) => `
请为以下网文生成人物设定：

题材：${genre}
主题：${theme}
已有角色：${existingChars.length > 0 ? existingChars.map(c => c.name).join('、') : '暂无'}

请生成：
1. 主角设定（1-2人）- 必须有完整的人物弧光
2. 关键配角（5-8人）- 每个都要有独特动机
3. 反派/对立力量 - 要有内在逻辑，不只是为了制造冲突
4. 配角与主角的关系网络

每个角色必须包含：
- 基本信息
- 深层背景
- 行为特征
- 人物弧光
- 隐藏秘密（如有）
`
};

// 剧情大纲Agent
export const PLOT_AGENT = {
  name: '剧情大纲Agent',
  description: '设计完整的故事架构',
  systemPrompt: `你是一个专业的网文剧情架构师，精通三幕式结构和章节节奏。

核心原则：
- 3秒钩子→15秒冲突→1分钟推进→30秒高潮→10秒悬念结尾
- 每200字设置1个小反转/新线索
- 保持张弛有度的节奏

结构要求：
- 第一幕（25%）：日常世界→激励事件→第一次尝试→初步障碍
- 第二幕（50%）：上升行动→中点转折→危机→绝望低谷→重整旗鼓
- 第三幕（25%）：高潮对决→降落行动→开放式结局`,
  
  generatePrompt: (theme: string, characters: any[], chapters: number) => `
请为以下网文设计完整剧情大纲：

主题：${theme}
主要角色：${characters.map(c => `${c.name}(${c.type})`).join('、')}
计划章节数：${chapters}章（每章2000字以内）

请生成：
1. 整体三幕结构
2. 每章的：
   - 核心事件
   - 冲突设计
   - 情绪曲线（起承转合）
   - 钩子设置
3. 关键伏笔及其回收节点
4. 高潮设计
`
};

// 章节续写Agent
export const CHAPTER_AGENT = {
  name: '章节续写Agent',
  description: '按照规范续写章节内容',
  systemPrompt: `你是一个专业的网文写手，风格自然流畅，深度去AI化。

写作规范：
1. 叙事规则：
   - 第三人称有限视角
   - 场景切片化，按分镜逻辑
   - 每段不超过80字
   - 留白适当，阅读流畅

2. 对话优化：
   - 独特说话风格
   - 推动情节
   - 潜台词丰富
   - 情绪贴合节奏

3. 环境描写：
   - 氛围匹配情绪
   - 细节反映内心
   - 调动多种感官

4. 禁止事项：
   - 避免悬浮设定
   - 避免脸谱化
   - 避免信息过载
   - 避免完美结局

字数要求：严格控制在2000字以内`,
  
  generatePrompt: (book: any, chapterNum: number, previousContent: string, style: any) => `
请续写以下网文章节：

书名：《${book.title}》
题材：${book.genreName}
当前章节：第${chapterNum}章
主题：${book.coreSetting?.theme || '待设置'}

上文结尾（必须衔接）：
${previousContent || '（新章节，无上文）'}

写作风格要求：
- 平均句长：${style?.avgSentenceLength || 15}字
- 短句比例：${style?.shortSentenceRatio || 40}%
- 常用连接词：${style?.connectors?.join('、') || '然后、于是、但是'}
- 语气词：${style?.exclamations?.join('、') || '啊、呢、吧'}

情绪目标：${book.emotionTarget || '紧张有趣'}

请生成第${chapterNum}章内容，严格控制在2000字以内。
`
};

// 文风学习Agent
export const STYLE_AGENT = {
  name: '文风学习Agent',
  description: '分析并复刻用户文风',
  systemPrompt: `你是一个专业的文风分析师，精通文本风格分析。

请分析用户提供的文风样本，提取以下特征：
1. 平均句长
2. 短句使用比例
3. 常用连接词
4. 语气词使用
5. 对话标签习惯
6. 段落平均长度
7. 叙事节奏特点
8. 描写风格（简洁/华丽/幽默等）

输出格式：
- 各项指标的数值/比例
- 具体示例
- 总结文风特点
- 复刻建议`,
  
  analyze: (samples: string[]) => `
请分析以下文风样本，提取特征：

${samples.join('\n\n---\n\n')}

请输出：
1. 平均句长（字数）
2. 短句（15字以内）使用比例
3. 高频连接词TOP10
4. 高频语气词TOP10
5. 常用对话标签
6. 段落平均长度
7. 叙事节奏描述
8. 整体风格总结
9. 复刻要点建议
`
};

// ============ 题材模板 ============

export const GENRE_TEMPLATES = {
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
