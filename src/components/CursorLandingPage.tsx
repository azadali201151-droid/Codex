import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Command, 
  RefreshCw, 
  Sliders, 
  Terminal,
  Activity,
  ArrowUpRight,
  GitBranch,
  Search,
  MessageSquare,
  ChevronRight,
  Plus,
  X,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { extraLandingT, getTabScenarios } from './landingTranslations';

interface CursorLandingPageProps {
  onEnterIDE: () => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
  setCurrentLang: (lang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi') => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

// Sub-component 1: Self-contained Orbit Gravity Simulator for the Live Preview Panel
function OrbitDemoSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anchorsArray, setAnchorsArray] = useState<{ x: number; y: number; mass: number; color: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localParticles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      trail: { x: number; y: number }[];
    }[] = [];

    // Setup initial size
    canvas.width = canvas.parentElement?.clientWidth || 320;
    canvas.height = canvas.parentElement?.clientHeight || 280;

    const initialAnchors = [
      { x: canvas.width / 2, y: canvas.height / 2, mass: 600, color: '#0ea5e9' }
    ];
    setAnchorsArray(initialAnchors);

    // Generate random particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 60 + 40;
      const px = canvas.width / 2 + Math.cos(angle) * r;
      const py = canvas.height / 2 + Math.sin(angle) * r;
      const speed = Math.random() * 1.5 + 1;
      
      localParticles.push({
        x: px,
        y: py,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        size: Math.random() * 1.5 + 1,
        color: `hsl(${Math.random() * 40 + 190}, 90%, 65%)`,
        trail: []
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw anchors
      initialAnchors.forEach(anchor => {
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = anchor.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = anchor.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and draw particles
      localParticles.forEach(p => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        // Gravitational force pull
        initialAnchors.forEach(anchor => {
          const dx = anchor.x - p.x;
          const dy = anchor.y - p.y;
          const distSq = dx * dx + dy * dy + 50;
          const dist = Math.sqrt(distSq);
          const force = anchor.mass / distSq;
          
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        });

        p.x += p.vx;
        p.y += p.vy;

        // Bounce code
        if (p.x < 0 || p.x > canvas.width) p.vx *= -0.9;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -0.9;

        // Paint Trail
        ctx.beginPath();
        for (let i = 0; i < p.trail.length; i++) {
          const pt = p.trail[i];
          const alpha = i / p.trail.length;
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha * 0.12;
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Paint Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1.0;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Resize listener
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-neutral-950 flex flex-col items-stretch overflow-hidden font-sans">
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5 bg-neutral-900/90 text-neutral-300 text-[10px] uppercase font-bold px-2 py-1 border border-neutral-800 rounded-md tracking-wider">
        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
        Interactive Render Frame : Gravity Physics
      </div>
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />
      <div className="absolute bottom-2 left-3 right-3 text-[9px] text-neutral-400 bg-neutral-900/85 p-1.5 border border-neutral-800 rounded-md select-none text-center">
        Double click in the sandbox workspace to inject heavy anchor masses!
      </div>
    </div>
  );
}

// Sub-component 2: Interactive Presentation/Layout Carousel Widget
function CarouselDemoSimulation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    { title: "Virtual Sandbox Core", desc: "Compile zero-dependency templates directly in fully responsive browser containers.", tag: "Edge VM", color: "from-sky-500 to-cyan-500", label: "01" },
    { title: "Parallel Prompt Chains", desc: "Let distinct autonomous sub-processors refactor files, checks, and layouts simultaneously.", tag: "Agents v2", color: "from-indigo-500 to-purple-500", label: "02" },
    { title: "Live Sync Auto-Deploy", desc: "Watch updates compile incrementally into production static bundles with active live state.", tag: "Direct Host", color: "from-pink-500 to-rose-500", label: "03" }
  ];

  return (
    <div className="w-full h-full bg-stone-950 flex flex-col p-5 justify-between font-sans leading-relaxed select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest bg-teal-950/40 border border-teal-900/55 px-2 py-0.5 rounded-full">
          Responsive Presentation
        </span>
        <span className="text-stone-500 font-mono text-[10px]">{activeIndex + 1} of 3</span>
      </div>

      <div className="my-auto py-3">
        <div className="relative overflow-hidden h-32">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 flex flex-col justify-center transition-all duration-300 transform ${
                idx === activeIndex 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : idx < activeIndex 
                    ? 'opacity-0 -translate-y-8 scale-95 pointer-events-none' 
                    : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-bold text-neutral-950 bg-gradient-to-r ${item.color}`}>
                  {item.tag}
                </span>
                <span className="text-stone-600 font-mono text-xs font-black">{item.label}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-900 pt-3">
        <div className="flex gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activeIndex ? 'w-6 bg-teal-400' : 'w-2 bg-stone-800'}`}
              title={`View slide ${idx + 1}`}
            />
          ))}
        </div>
        <button 
          onClick={() => setActiveIndex((prev) => (prev + 1) % 3)}
          className="text-[10px] flex items-center gap-1 text-teal-400 font-bold hover:text-teal-300 transition-colors bg-teal-950/20 px-2 py-1 rounded cursor-pointer"
        >
          Next Slide <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Sub-component 3: Simple interactive task and feedback widget
function InteractiveNotesWidget() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Examine about-acme.md files", done: true },
    { id: 2, text: "Draft physics layout algorithm", done: true },
    { id: 3, text: "Test gravity friction controls", done: false }
  ]);
  const [newText, setNewText] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newText.trim(), done: false }]);
    setNewText("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col p-4 justify-between font-sans leading-normal">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-neutral-900 pb-2">
          <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider">
            Agent Task Checklist
          </span>
          <span className="text-[9px] text-neutral-500 font-mono">Sandbox Local Task list</span>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-2 cursor-pointer group bg-neutral-900/60 p-2 border border-neutral-900 hover:border-neutral-800 rounded-md transition-all"
            >
              <div className={`w-3.5 h-3.5 rounded border border-neutral-700 flex items-center justify-center transition-all ${task.done ? 'bg-fuchsia-500 border-fuchsia-400 text-neutral-950' : 'group-hover:bg-neutral-800'}`}>
                {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-xs select-none transition-all ${task.done ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-1.5 mt-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add unrequested task spec..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
        <button 
          type="submit"
          className="p-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded transition-colors text-xs flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function CursorLandingPage({ 
  onEnterIDE, 
  currentLang, 
  setCurrentLang, 
  isDarkMode, 
  setIsDarkMode 
}: CursorLandingPageProps) {
  // Simulator State Machine
  // Active demo index: 0: Orbit, 1: Carousel, 2: Task Board
  const [activeTab, setActiveTab] = useState<number>(0);
  const [typedPrompt, setTypedPrompt] = useState<string>("");
  const [playbackStep, setPlaybackStep] = useState<'typing' | 'thinking' | 'writing' | 'rendered'>('typing');
  const [thinkTimer, setThinkTimer] = useState<number>(0);
  const [currentFilePatched, setCurrentFilePatched] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("Standby");
  
  // Custom states for completing the home page with interactive features
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("Opus 4.8");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  // New Language Selector and Dark Mode Toggle configurations
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);

  const nativeLanguageNames = {
    en: 'English',
    zh: '简体中文',
    ja: '日本語',
    zht: '繁體中文',
    es: 'Español',
    fr: 'Français',
    pt: 'Português',
    ko: '한국어',
    de: 'Deutsch',
    hi: 'हिन्दी'
  } as const;

  const t = {
    en: {
      product: "Product",
      enterprise: "Enterprise",
      pricing: "Pricing",
      resources: "Resources",
      signIn: "Sign in",
      contact: "Contact",
      openIDE: "Open Sandbox IDE",
      heroBadge: "Autonomous Multi-Agent Composer V2 Active",
      heroTitle: "The agent-native way to build ambitious software.",
      heroSubtitle: "Codex is an advanced development sandbox wrapped in full-stack AI. Hand off intricate files, watch agents refactor logic, and run live rendered output directly in real time.",
      getStarted: "Get started free",
      watchLive: "Watch live work",
      gravityOrbits: "Gravity Orbits",
      slideCarousel: "Slide Carousel",
      interactivePlanner: "Interactive Planner",
      viewAllBlog: "View all blog posts",
      recentHighlights: "Recent Highlights",
      recentHighlightsSub: "Read our comprehensive engineering benchmarks, model evaluations, and research reports updated daily by the Codex engineering team.",
      downloadTitle: "Try Codex now.",
      downloadBtn: "Download for Windows & macOS",
      allSystems: "All Systems Operational",
      pricingTitle: "Sleek Pricing for any project scale.",
      pricingSubtitle: "Start for free inside our sandboxed editor, and upgrade as your agent pipeline density expands.",
      level01: "Level 01",
      level02: "Level 02",
      level03: "Level 03",
      hobbyist: "Hobbyist",
      proMaster: "Pro Master",
      enterprisePlan: "Enterprise",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "Custom",
      hobbyistDesc: "Free basic sandbox with immediate access to autonomous templates and predictive autocomplete.",
      proDesc: "Maximize capability. Unlimited fast editor prompts and synchronized multi-agent pipelines.",
      enterpriseDesc: "For complete technical organizations. Specialized isolated cloud VMs, OAuth credentials, and custom rule enforcement files.",
      hobbyistFeature1: "50 short agent runs / month",
      hobbyistFeature2: "Full-stack editor panel access",
      hobbyistFeature3: "Local sandboxed render screens",
      proFeature1: "Unlimited fast agent prompts",
      proFeature2: "10 custom project templates",
      proFeature3: "Co-Pilot automated pull checks",
      proFeature4: "Interactive file drag integration",
      enterpriseFeature1: "Custom isolated cloud runners",
      enterpriseFeature2: "Custom OAuth integration models",
      enterpriseFeature3: "Dedicated developer support logs",
      startFree: "Start Free",
      getPro: "Get Codex Pro v2",
      contactOrg: "Contact Organizations",
      appliedResearchTitle: "Codex is an applied research team focused on building the future of software development.",
      appliedResearchText: "We believe that software engineering will be completely co-operative. Join a hyper-focused team of engineers scaling model capabilities, compilers, and UI tools.",
      joinUs: "Join us"
    },
    zh: {
      product: "产品",
      enterprise: "企业",
      pricing: "价格方案",
      resources: "资源中心",
      signIn: "登录",
      contact: "联系我们",
      openIDE: "打开沙盒 IDE",
      heroBadge: "自主型多智能体 Composer V2 激活",
      heroTitle: "构建宏伟软件的智能体原生方式。",
      heroSubtitle: "Codex 是一个融合了全栈 AI 的先进开发沙盒。只需提交复杂文件，观察智能体如何重构逻辑，并在实时环境中直接运行渲染输出。",
      getStarted: "免费开始使用",
      watchLive: "查看实时工作",
      gravityOrbits: "重力轨道",
      slideCarousel: "幻灯片轮播",
      interactivePlanner: "互动规划器",
      viewAllBlog: "查看所有博客文章",
      recentHighlights: "最近亮点",
      recentHighlightsSub: "阅读由 Codex 工程团队每日更新的全面工程基准测试、模型评估和研究报告报告。",
      downloadTitle: "现在体验 Codex。",
      downloadBtn: "下载 Windows & macOS 版",
      allSystems: "所有系统运行正常",
      pricingTitle: "适用于任何项目规模的极简价格。",
      pricingSubtitle: "在我们的沙盒编辑器中免费开始，并根据智能体管道密度的扩展进行升级。",
      level01: "级别 01",
      level02: "级别 02",
      level03: "级别 03",
      hobbyist: "爱好者",
      proMaster: "专业大师",
      enterprisePlan: "企业版",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "定制",
      hobbyistDesc: "免费的基础沙盒，即时访问自主模板和预测自动补全。",
      proDesc: "最大化能力。无限快速编辑器提示和同步的多智能体管道。",
      enterpriseDesc: "适用于完整的技术组织。专门的隔离云虚拟机、OAuth 凭证和自定义规则强制执行文件。",
      hobbyistFeature1: "每月 50 次智能体运行",
      hobbyistFeature2: "全栈编辑器面板访问权限",
      hobbyistFeature3: "本地沙盒渲染屏幕",
      proFeature1: "无限快速智能体提示",
      proFeature2: "10 个自定义项目模板",
      proFeature3: "Co-Pilot 自动拉取检查",
      proFeature4: "交互式文件拖放集成",
      enterpriseFeature1: "定制隔离云运行器",
      enterpriseFeature2: "定制 OAuth 集成模型",
      enterpriseFeature3: "专职开发人员支持日志",
      startFree: "免费开始",
      getPro: "获取 Codex Pro v2",
      contactOrg: "联系企业组织",
      appliedResearchTitle: "Codex 是一个专注于构建软件开发未来的应用研究团队。",
      appliedResearchText: "我们相信软件工程将是完全合作式的。加入一个由工程师组成的紧密聚焦的团队，共同扩展模型能力、编译器和 UI 工具。",
      joinUs: "加入我们"
    },
    ja: {
      product: "製品",
      enterprise: "事業・企業",
      pricing: "料金プラン",
      resources: "リソース",
      signIn: "サインイン",
      contact: "お問い合わせ",
      openIDE: "サンドボックスIDEに入る",
      heroBadge: "自律型マルチエージェント Composer V2 アクティブ",
      heroTitle: "エージェントネイティブなソフトウェア开发の極み。",
      heroSubtitle: "Codexは、高度な開発サンドボックスにフルスタックAIを融合。複数のファイルを渡すだけで自律的にコードを調整し、即時プレビューを実行します。",
      getStarted: "無料で始める",
      watchLive: "ライブデモ動画",
      gravityOrbits: "重力シミュレーション",
      slideCarousel: "製品カタログ",
      interactivePlanner: "プロジェクト管理",
      viewAllBlog: "すべての記事を読む",
      recentHighlights: "最新の技術リリース & 論文",
      recentHighlightsSub: "Codex開発者が発信する、マルチエージェントコンパイラや最先端の自律エディタに関する技術資料一覧です。",
      downloadTitle: "新世代のAI開発を体験する。",
      downloadBtn: "Windows & macOS版をダウンロード",
      allSystems: "全システム正常運用中",
      pricingTitle: "プロジェクトの規模に応じた、最適なプラン体系。",
      pricingSubtitle: "まずは無料のサンドボックスをお試しください。エージェントが必要になったら、Pro版へいつでもアップグレード可能です。",
      level01: "レベル 01",
      level02: "レベル 02",
      level03: "レベル 03",
      hobbyist: "ホビースト",
      proMaster: "プロ・マスター",
      enterprisePlan: "エンタープライズ",
      hobbyistPrice: "¥0",
      proPrice: "¥3,000",
      enterprisePrice: "カスタム",
      hobbyistDesc: "Predictive autocomplete機能と基本的なテンプレートを、登録不要で即座に使用可能な無料モデル。",
      proDesc: "最高の開発効率。マルチコアのエージェント処理と、無限に続く補完プロンプトシステム。",
      enterpriseDesc: "エンタープライズ顧客向け。安全性が担保された独立VMの構築、OAuthの連携、セキュリティポリシー制御。",
      hobbyistFeature1: "月50回までのエージェント呼び出し",
      hobbyistFeature2: "フル機能 of Webエディタアクセス",
      hobbyistFeature3: "ローカルレンダリングシミュレーター",
      proFeature1: "無限のコンパイルプロンプト",
      proFeature2: "10個までのカスタムテンプレート保存",
      proFeature3: "Co-Pilot自動コードレビュー",
      proFeature4: "ファイル添付・ドラッグ＆ドロップドラフト",
      enterpriseFeature1: "完全に隔離されたSandboxサーバー",
      enterpriseFeature2: "独自プロバイダ用のOAuthログイン設定",
      enterpriseFeature3: "24時間対応のサポート＆デバッグ監査",
      startFree: "無料で始める",
      getPro: "Codex Pro v2 を契約",
      contactOrg: "営業に問い合わせる",
      appliedResearchTitle: "Codexはソフトウェアの再発明を目指す、先端応用技術の研究グループです。",
      appliedResearchText: "私たちは真に人と共同で学習するエージェントツールを追求しています。最前線に立つ優秀なメンバーと共に働きませんか？",
      joinUs: "採用情報を確認"
    },
    zht: {
      product: "產品",
      enterprise: "企業方案",
      pricing: "價格方案",
      resources: "資源中心",
      signIn: "登錄",
      contact: "聯絡我們",
      openIDE: "打開沙箱 IDE",
      heroBadge: "自主型多智能體 Composer V2 啟用",
      heroTitle: "建構宏偉軟體的智能體原生方式。",
      heroSubtitle: "Codex 是一個融合了全棧 AI 的先進開發沙箱。只需提交複雜檔案，觀察智能體如何重構邏輯，並在即時環境中直接運行渲染輸出。",
      getStarted: "免費開始使用",
      watchLive: "查看即時工作",
      gravityOrbits: "重力軌道",
      slideCarousel: "投影片輪播",
      interactivePlanner: "互動規劃器",
      viewAllBlog: "查看所有部落格文章",
      recentHighlights: "最近亮點",
      recentHighlightsSub: "閱讀由 Codex 工程團隊每日更新的全面工程基準測試、模型評估和研究報告報告。",
      downloadTitle: "現在體驗 Codex。",
      downloadBtn: "下載 Windows & macOS 版",
      allSystems: "所有系統運行正常",
      pricingTitle: "適用於任何專案規模的極簡價格。",
      pricingSubtitle: "在我們的沙箱編輯器中免費開始，並根據智能體管道密度的擴展進行升級。",
      level01: "等級 01",
      level02: "等級 02",
      level03: "等級 03",
      hobbyist: "愛好者",
      proMaster: "專業大師",
      enterprisePlan: "企業版",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "定制",
      hobbyistDesc: "免費的基礎沙箱，即時存取自主範本和預測自動補全。",
      proDesc: "最大化能力。無限快速編輯器提示和同步的多智能體管道。",
      enterpriseDesc: "適用於完整的技術組織。專門的隔離雲端虛擬機、OAuth 憑證和自訂規則強制執行檔案。",
      hobbyistFeature1: "每月 50 次智能體運行",
      hobbyistFeature2: "全棧編輯器面板存取權限",
      hobbyistFeature3: "本地沙箱渲染螢幕",
      proFeature1: "無限快速智能體提示",
      proFeature2: "10 個自訂專案範本",
      proFeature3: "Co-Pilot 自動拉取檢查",
      proFeature4: "互動式檔案拖放整合",
      enterpriseFeature1: "定制隔離雲端運行器",
      enterpriseFeature2: "定制 OAuth 整合模型",
      enterpriseFeature3: "專職開發人員支援日誌",
      startFree: "免費開始",
      getPro: "獲取 Codex Pro v2",
      contactOrg: "聯絡企業組織",
      appliedResearchTitle: "Codex 是一個專專注於建構軟體開發未來的應用研究團隊。",
      appliedResearchText: "我們相信軟體工程將是完全合作式的。加入一個由工程師組成的緊密聚焦的團隊，共同擴展模型能力、編譯器和 UI 工具。",
      joinUs: "加入我們"
    },
    es: {
      product: "Producto",
      enterprise: "Empresa",
      pricing: "Precios",
      resources: "Recursos",
      signIn: "Iniciar sesión",
      contact: "Contacto",
      openIDE: "Abrir IDE Sandbox",
      heroBadge: "Composer V2 Multiajuste Autónomo Activo",
      heroTitle: "La forma nativa de agentes para crear software ambicioso.",
      heroSubtitle: "Codex es un entorno de pruebas avanzado impulsado por IA full-stack. Permites delegar archivos complejos, ver a los agentes refactorizar la lógica y ejecutar vistas en directo en tiempo real.",
      getStarted: "Comenzar gratis",
      watchLive: "Ver trabajo en vivo",
      gravityOrbits: "Órbitas de Greavedad",
      slideCarousel: "Carrusel de Diapositivas",
      interactivePlanner: "Planificador de Tareas",
      viewAllBlog: "Ver todas las publicaciones",
      recentHighlights: "Artículos Destacados",
      recentHighlightsSub: "Lea nuestras evaluaciones de modelos de ingeniería, análisis de rendimiento y reportes de investigación de Codex actualizados a diario.",
      downloadTitle: "Pruebe Codex ahora.",
      downloadBtn: "Descargar para Windows y macOS",
      allSystems: "Sistemas en Conexión",
      pricingTitle: "Tarifas adaptables para cualquier escala de proyecto.",
      pricingSubtitle: "Inicie de forma gratuita dentro de nuestro editor de sandbox y escale a medida que crezca su densidad de agentes.",
      level01: "Nivel 01",
      level02: "Nivel 02",
      level03: "Nivel 03",
      hobbyist: "Aficionado",
      proMaster: "Maestro Pro",
      enterprisePlan: "Corporativo",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "Personalizado",
      hobbyistDesc: "Sandbox básico gratuito con acceso inmediato a plantillas de inicio y autocompletado inteligente.",
      proDesc: "Máxima capacidad. Prompts ilimitados y pipelines complejos con agentes en paralelo.",
      enterpriseDesc: "Para organizaciones complejas de tecnología. VMs aisladas en la nube, credenciales federadas y seguridad avanzada.",
      hobbyistFeature1: "50 ejecuciones de agentes al mes",
      hobbyistFeature2: "Acceso completo al panel del editor",
      hobbyistFeature3: "Entorno de renderizado local",
      proFeature1: "Ejecución continua de prompts",
      proFeature2: "10 plantillas de proyecto personalizadas",
      proFeature3: "Revisiones automáticas Co-Pilot",
      proFeature4: "Carga dinámica de archivos",
      enterpriseFeature1: "Entornos dedicados de cómputo",
      enterpriseFeature2: "Modelos e integraciones OAuth",
      enterpriseFeature3: "Soporte de ingeniería en directo",
      startFree: "Empezar Gratis",
      getPro: "Obtener Codex Pro v2",
      contactOrg: "Contactar Ventas",
      appliedResearchTitle: "Codex es un laboratorio de investigación aplicada dedicado a construir el futuro del software.",
      appliedResearchText: "Creemos firmemente en el desarrollo de software colaborativo guiado por agentes. Únase hoy para escalar la computación inteligente.",
      joinUs: "Únase al equipo"
    },
    fr: {
      product: "Produit",
      enterprise: "Entreprise",
      pricing: "Tarifs",
      resources: "Ressources",
      signIn: "Se connecter",
      contact: "Contact",
      openIDE: "Ouvrir l'IDE Sandbox",
      heroBadge: "Composer V2 multi-agents autonome actif",
      heroTitle: "La méthode native agent pour concevoir des logiciels ambitieux.",
      heroSubtitle: "Codex est un sandbox de développement avancé enveloppé d'IA full-stack. Déléguez des fichiers complexes, observez les agents refactoriser la logique et exécutez le rendu en direct en temps réel.",
      getStarted: "Démarrer gratuitement",
      watchLive: "Voir le travail en direct",
      gravityOrbits: "Orbites de gravité",
      slideCarousel: "Carrousel de diapositives",
      interactivePlanner: "Planificateur interactif",
      viewAllBlog: "Voir tous les articles",
      recentHighlights: "Dernières actualités",
      recentHighlightsSub: "Découvrez nos analyses d'ingénierie complètes, évaluations de modèles et rapports de recherche mis à jour quotidiennement par l'équipe Codex.",
      downloadTitle: "Essayer Codex maintenant.",
      downloadBtn: "Télécharger pour Windows & macOS",
      allSystems: "Tous les systèmes opérationnels",
      pricingTitle: "Des tarifs adaptés à chaque projet.",
      pricingSubtitle: "Commencez gratuitement dans notre éditeur bac à sable et évoluez à mesure que la densité de vos pipelines d'agents augmente.",
      level01: "Niveau 01",
      level02: "Niveau 02",
      level03: "Niveau 03",
      hobbyist: "Hobbyist",
      proMaster: "Pro Master",
      enterprisePlan: "Entreprise",
      hobbyistPrice: "0 $",
      proPrice: "20 $",
      enterprisePrice: "Sur mesure",
      hobbyistDesc: "Sandbox de base gratuit avec accès immédiat à des modèles autonomes et autocomplétion prédictive.",
      proDesc: "Maximisez vos capacités. Prompts rapides illimités et pipelines multi-agents synchronisés.",
      enterpriseDesc: "Pour les organisations techniques complètes. Machines virtuelles isolées dans le cloud, identifiants OAuth et application de règles personnalisées.",
      hobbyistFeature1: "50 lancements d'agents / mois",
      hobbyistFeature2: "Accès complet au panneau éditeur",
      hobbyistFeature3: "Écrans de rendu sandbox locaux",
      proFeature1: "Invites d'agents rapides illimitées",
      proFeature2: "10 modèles de projet personnalisés",
      proFeature3: "Vérifications automatiques Co-Pilot",
      proFeature4: "Intégration interactive glisser-déposer",
      enterpriseFeature1: "Exécuteurs cloud isolés sur mesure",
      enterpriseFeature2: "Modèles d'intégration OAuth sur mesure",
      enterpriseFeature3: "Rapports de support dédiés aux développeurs",
      startFree: "Commencer gratuit",
      getPro: "Obtenir Codex Pro v2",
      contactOrg: "Contacter l'organisation",
      appliedResearchTitle: "Codex est une équipe de recherche appliquée dédiée à la création du futur développement logiciel.",
      appliedResearchText: "We believe that software engineering will be completely co-operative. Join a hyper-focused team of engineers scaling model capabilities, compilers, and UI tools.",
      joinUs: "Nous rejoindre"
    },
    pt: {
      product: "Produto",
      enterprise: "Corporativo",
      pricing: "Preços",
      resources: "Recursos",
      signIn: "Entrar",
      contact: "Contato",
      openIDE: "Abrir IDE Sandbox",
      heroBadge: "Composer V2 Multi-Agente Autônomo Ativo",
      heroTitle: "A maneira nativa de agentes para construir softwares ambiciosos.",
      heroSubtitle: "Codex é um sandbox de desenvolvimento avançado envolto em IA full-stack. Entregue arquivos complexos, assista aos agentes refatorando a lógica e execute saídas em tempo real diretamente.",
      getStarted: "Começar gratuitamente",
      watchLive: "Assistir trabalho ao vivo",
      gravityOrbits: "Órbitas de gravidade",
      slideCarousel: "Carrossel de slides",
      interactivePlanner: "Planejador interativo",
      viewAllBlog: "Ver todas as postagens",
      recentHighlights: "Destaques recentes",
      recentHighlightsSub: "Leia nossas avaliações completas de engenharia, avaliações de modelos e relatórios de pesquisa atualizados diariamente pela equipe Codex.",
      downloadTitle: "Experimente o Codex agora.",
      downloadBtn: "Download para Windows e macOS",
      allSystems: "Todos os sistemas operacionais",
      pricingTitle: "Preços elegantes para qualquer escala de projeto.",
      pricingSubtitle: "Comece gratuitamente em nosso editor sandbox e atualize à medida que a densidade do pipeline do seu agente se expande.",
      level01: "Nível 01",
      level02: "Nível 02",
      level03: "Nível 03",
      hobbyist: "Entusiasta",
      proMaster: "Pro Master",
      enterprisePlan: "Corporativo",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "Personalizado",
      hobbyistDesc: "Sandbox básico gratuito com acesso imediato a modelos autônomos e autocompletar preditivo.",
      proDesc: "Maximize a capacidade. Prompts de editor rápidos ilimitados e pipelines de múltiplos agentes sincronizados.",
      enterpriseDesc: "Para organizações técnicas completas. VMs isoladas na nuvem, credenciais OAuth e aplicação de regras personalizadas.",
      hobbyistFeature1: "50 execuções de agentes / mês",
      hobbyistFeature2: "Acesso total ao painel do editor",
      hobbyistFeature3: "Telas de renderização locais em sandbox",
      proFeature1: "Prompts de agente ilimitados e rápidos",
      proFeature2: "10 modelos de projeto personalizados",
      proFeature3: "Verificações automáticas de pull Co-Pilot",
      proFeature4: "Integração interativa de arrastar arquivos",
      enterpriseFeature1: "Executores em nuvem isolados customizados",
      enterpriseFeature2: "Modelos customizados de integração OAuth",
      enterpriseFeature3: "Logs dedicados de suporte ao desenvolvedor",
      startFree: "Iniciar Grátis",
      getPro: "Obter Codex Pro v2",
      contactOrg: "Contatar Vendas",
      appliedResearchTitle: "Codex é uma equipe de pesquisa aplicada focada em construir o futuro do desenvolvimento de software.",
      appliedResearchText: "Acreditamos que a engenharia de software será totalmente cooperativa. Junte-se a uma equipe hiperfocalizada de engenheiros que escalam recursos de modelo, compiladores e ferramentas de interface.",
      joinUs: "Junte-se a nós"
    },
    ko: {
      product: "제품",
      enterprise: "엔터프라이즈",
      pricing: "요금제",
      resources: "리소스",
      signIn: "로그인",
      contact: "문의하기",
      openIDE: "샌드박스 IDE 열기",
      heroBadge: "자율형 멀티 에이전트 Composer V2 활성화됨",
      heroTitle: "대담한 소프트웨어를 구축하는 에이전트 네이티브 방식.",
      heroSubtitle: "Codex는 풀스택 AI로 둘러싸인 고급 개발 샌드박스입니다. 복잡한 파일을 제출하고 에이전트가 로직을 리팩토링하는 모습을 지켜보며 라이브로 렌더링된 출력을 실시간으로 직접 실행해 보세요.",
      getStarted: "무료로 시작하기",
      watchLive: "라이브 작업 시청",
      gravityOrbits: "중력 궤도",
      slideCarousel: "슬라이드 캐러셀",
      interactivePlanner: "대화형 플래너",
      viewAllBlog: "모든 블로그 게시물 보기",
      recentHighlights: "최근 하이라이트",
      recentHighlightsSub: "Codex 엔지니어링 팀이 매일 제공하는 종합적인 엔지니어링 벤치마크, 모델 평가, 연구 보고서를 확인해 보세요.",
      downloadTitle: "지금 Codex를 체험해 보세요.",
      downloadBtn: "Windows 및 macOS용 다운로드",
      allSystems: "모든 시스템 정상 작동 중",
      pricingTitle: "모든 프로젝트 규모에 맞는 세련된 요금제.",
      pricingSubtitle: "샌드박스 에디터 내에서 무료로 시작하고 에이전트 파이프라인 밀도가 확장됨에 따라 업그레이드하세요.",
      level01: "레벨 01",
      level02: "레벨 02",
      level03: "레벨 03",
      hobbyist: "입문자",
      proMaster: "프로 마스터",
      enterprisePlan: "엔터프라이즈",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "맞춤형",
      hobbyistDesc: "자율형 템플릿과 예측 자동 완성 기능에 즉시 액세스할 수 있는 무료 기본 샌드박스.",
      proDesc: "최대의 역량을 확보하세요. 무제한 빠른 에디터 프롬프트와 동기화된 멀티 에이전트 파이프라인을 지원합니다.",
      enterpriseDesc: "전체 기술 조직을 위함입니다. 전용 격리 클라우드 VM, OAuth 자격 증명, 사용자 정의 규칙 적용 파일.",
      hobbyistFeature1: "월 50회 에이전트 실행",
      hobbyistFeature2: "풀스택 에디터 패널 액세스",
      hobbyistFeature3: "로컬 샌드박스 렌더링 화면",
      proFeature1: "무제한 빠른 에이전트 프롬프트",
      proFeature2: "10개의 사용자 정의 프로젝트 템플릿",
      proFeature3: "Co-Pilot 자동 풀 검사",
      proFeature4: "대화형 파일 드래그 통합",
      enterpriseFeature1: "맞춤형 격리 클라우드 러너",
      enterpriseFeature2: "맞춤형 OAuth 통합 모델",
      enterpriseFeature3: "전담 개발자 지원 로그",
      startFree: "무료로 시작",
      getPro: "Codex Pro v2 받기",
      contactOrg: "기업 문의",
      appliedResearchTitle: "Codex는 소프트웨어 개발의 미래를 구축하는 데 중점을 둔 응용 연구 팀입니다.",
      appliedResearchText: "우리는 소프트웨어 엔지니어링이 완전히 협력적으로 이루어질 것이라고 믿습니다. 모델 기능, 컴파일러 및 UI 도구를 개발하는 고도로 집중된 엔지니어 팀에 합류하세요.",
      joinUs: "합류하기"
    },
    de: {
      product: "Produkt",
      enterprise: "Kunden",
      pricing: "Preise",
      resources: "Ressourcen",
      signIn: "Anmelden",
      contact: "Kontakt",
      openIDE: "Sandbox-IDE öffnen",
      heroBadge: "Autonomer Multi-Agenten-Composer V2 Aktiv",
      heroTitle: "Die Agenten-native Art, ambitionierte Software zu bauen.",
      heroSubtitle: "Codex is eine hochentwickelte Entwicklungsumgebung, umhüllt von einer intelligenten Full-Stack-KI. Komplexe Dateien übergeben, automatische Refaktorisierung beobachten und Live-Ergebnisse direkt in Echtzeit ausführen.",
      getStarted: "Kostenlos starten",
      watchLive: "Live-Arbeit anzeigen",
      gravityOrbits: "Gravitations-Orbits",
      slideCarousel: "Folien-Karussell",
      interactivePlanner: "Interaktiver Planer",
      viewAllBlog: "Alle Blogbeiträge ansehen",
      recentHighlights: "Aktuelle Highlights",
      recentHighlightsSub: "Ausführliche System-Eigenschaften, Benchmarks und Forschungsberichte, die täglich von unserem Technikbereich veröffentlicht werden.",
      downloadTitle: "Codex sofort testen.",
      downloadBtn: "Für Windows & macOS herunterladen",
      allSystems: "Alle Systeme betriebsbereit",
      pricingTitle: "Elegante Preise für jede Projektgröße.",
      pricingSubtitle: "Beginnen Sie kostenlos in unserer Sandbox-Umgebung und erweitern Sie nach Bedarf bei steigender Agenten-Dichte.",
      level01: "Stufe 01",
      level02: "Stufe 02",
      level03: "Stufe 03",
      hobbyist: "Hobby",
      proMaster: "Pro Meister",
      enterprisePlan: "Enterprise",
      hobbyistPrice: "0 €",
      proPrice: "20 €",
      enterprisePrice: "Individuell",
      hobbyistDesc: "Kostenfreie Basis-Sandbox mit Zugriff auf Templates und vorausschauende Autovervollständigung.",
      proDesc: "Maximale Performance. Ununterbrochene Agenten-Laufzeiten und mehrfache parallele Pipelines.",
      enterpriseDesc: "Für größere Technologieabteilungen. Private Cloud-Vms, personalisierte Zugriffskontrollen und maßgeschneiderte Sicherheitsregeln.",
      hobbyistFeature1: "50 Agenten-Iterationen / Monat",
      hobbyistFeature2: "Voller Zugriff auf das Editor-Panel",
      hobbyistFeature3: "Lokale Render-Vorschau in Echtzeit",
      proFeature1: "Unbegrenzte Chat- & Designprompts",
      proFeature2: "10 freie Projektvorlagen",
      proFeature3: "Automatisches Co-Pilot-Feedback",
      proFeature4: "Echte Drag & Drop Unterstützung",
      enterpriseFeature1: "Eigene dedizierte Server-Ressourcen",
      enterpriseFeature2: "Integrierte OAuth-Anmeldestatistiken",
      enterpriseFeature3: "Direkter Support durch Entwickler",
      startFree: "Kostenlos starten",
      getPro: "Codex Pro v2 erhalten",
      contactOrg: "Vertrieb kontaktieren",
      appliedResearchTitle: "Codex ist ein Labor für angewandte KI-Systeme im Bereich der Software-Entwicklung.",
      appliedResearchText: "Wir sind überzeugt, dass die Programmierung in enger Zusammenarbeit stattfinden wird. Werden Sie Teil unseres hyper-fokussierten Ingenieursteams.",
      joinUs: "Mitglied werden"
    },
    hi: {
      product: "उत्पाद",
      enterprise: "उद्यम",
      pricing: "कीमतें",
      resources: "संसाधनCenter",
      signIn: "लॉग इन",
      contact: "संपर्क करें",
      openIDE: "सैंडबॉक्स आईडीई खोलें",
      heroBadge: "स्वायत्त मल्टी-एजेंट कम्पोज़र V2 सक्रिय",
      heroTitle: "महत्वाकांक्षी सॉफ़्टवेयर बनाने का एजेंट-मूल तरीका।",
      heroSubtitle: "Codex एक उन्नत विकास सैंडबॉक्स है जो फुल-स्टैक एआई में लिपटा हुआ है। जटिल फ़ाइलें सौंपें, एजेंटों को लॉजिक को रिफैक्टर करते देखें, और वास्तविक समय में सीधे लाइव रेंडर किए गए आउटपुट चलाएं।",
      getStarted: "मुफ़्त में शुरू करें",
      watchLive: "लाइव काम देखें",
      gravityOrbits: "गुरुत्वाकर्षण कक्षाएं",
      slideCarousel: "स्लाइड कैरोसेल",
      interactivePlanner: "इंटरैक्टिव प्लानर",
      viewAllBlog: "सभी ब्लॉग पोस्ट देखें",
      recentHighlights: "हाल की मुख्य विशेषताएं",
      recentHighlightsSub: "Codex इंजीनियरिंग टीम द्वारा दैनिक रूप से अपडेट किए जाने वाले हमारे व्यापक इंजीनियरिंग बेंचमार्क, मॉडल मूल्यांकन और शोध रिपोर्ट पढ़ें।",
      downloadTitle: "Codex को अभी आज़माएं।",
      downloadBtn: "Windows और macOS के लिए डाउनलोड करें",
      allSystems: "सभी प्रणालियाँ चालू हैं",
      pricingTitle: "किसी भी परियोजना के पैमाने के लिए सुलभ मूल्य निर्धारण।",
      pricingSubtitle: "हमारे सैंडबॉक्स संपादक के भीतर मुफ़्त में शुरू करें, और अपने एजेंट पाइपलाइन घनत्व के विस्तार के साथ अपग्रेड करें।",
      level01: "स्तर 01",
      level02: "स्तर 02",
      level03: "स्तर 03",
      hobbyist: "शौकिया",
      proMaster: "प्रो मास्टर",
      enterprisePlan: "उद्यम",
      hobbyistPrice: "$0",
      proPrice: "$20",
      enterprisePrice: "अनुकूलित",
      hobbyistDesc: "स्वायत्त टेम्प्लेट और भविष्य कहने वाले स्वत:-पूर्णता तक तत्काल पहुंच के साथ मुफ़्त बुनियादी सैंडबॉक्स।",
      proDesc: "अपनी क्षमता का अधिकतम उपयोग करें। असीमित तेज़ संपादक संकेत और सिंक्रनाइज़ मल्टी-एजेंट पाइपलाइन।",
      enterpriseDesc: "पूर्ण तकनीकी संगठनों के लिए। पृथक क्लाउड वीएम, OAuth क्रेडेंशियल, और कस्टम नियम प्रवर्तन फाइलें।",
      hobbyistFeature1: "प्रति माह 50 एजेंट रन",
      hobbyistFeature2: "फुल-स्टैक संपादक पैनल तक पहुंच",
      hobbyistFeature3: "स्थानीय सैंडबॉक्स रेंडर स्क्रीन",
      proFeature1: "असीमित तेज़ एजेंट प्रॉम्प्ट",
      proFeature2: "10 कस्टम प्रोजेक्ट टेम्प्लेट",
      proFeature3: "Co-Pilot स्वचालित पुल जांच",
      proFeature4: "इंटरैक्टive फ़ाइल ड्रैग एकीकरण",
      enterpriseFeature1: "अनुकूलित पृथक क्लाउड रनर",
      enterpriseFeature2: "अनुकूलित OAuth एकीकरण मॉडल",
      enterpriseFeature3: "समर्पित डेवलपर सहायता लॉग",
      startFree: "मुफ़्त में शुरू करें",
      getPro: "Codex Pro v2 प्राप्त करें",
      contactOrg: "संस्थाओं से संपर्क करें",
      appliedResearchTitle: "Codex एक व्यावहारिक अनुसंधान टीम है जो सॉफ़्टवेयर विकास के भविष्य के निर्माण पर केंद्रित है।",
      appliedResearchText: "हमारा मानना है कि सॉफ़्टवेयर इंजीनियरिंग पूरी तरह से सहकारी होगी। मॉडल क्षमताओं, कंपाइलरों और यूआई टूल को बढ़ाने वाले इंजीनियरों की एक अत्यधिक केंद्रित टीम में शामिल हों।",
      joinUs: "हमसे जुड़ें"
    }
  };

  const currentT: any = {
    ...t[currentLang],
    ...(extraLandingT[currentLang] || extraLandingT.en)
  };

  // Prompts and files simulated inside the Cursor engine mock
  const tabScenarios = getTabScenarios(currentLang);

  // Typing simulator effect
  useEffect(() => {
    // Reset state for new tab selection
    setTypedPrompt("");
    setPlaybackStep('typing');
    setThinkTimer(0);
    setCurrentFilePatched("");
    setStatusText("Waiting for input...");

    const fullPrompt = tabScenarios[activeTab].prompt;
    let charIndex = 0;
    let timerInterval: NodeJS.Timeout;
    
    // Character-by-character typing loop
    const typingInterval = setInterval(() => {
      if (charIndex < fullPrompt.length) {
        setTypedPrompt(prev => prev + fullPrompt.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Switch to "Thinking" status, start stopwatch timer
        setPlaybackStep('thinking');
        setStatusText("Thought loop running...");
        let count = 0;
        
        timerInterval = setInterval(() => {
          count = Number((count + 0.1).toFixed(1));
          setThinkTimer(count);
          
          if (count >= 1.8) {
            clearInterval(timerInterval);
            
            // Switch to "Writing / patching file"
            setPlaybackStep('writing');
            setStatusText(`Patching ${tabScenarios[activeTab].file}...`);
            setCurrentFilePatched(tabScenarios[activeTab].file);
            
            setTimeout(() => {
              // Successfully complete and display
              setPlaybackStep('rendered');
              setStatusText("Ready");
            }, 1200);
          }
        }, 100);
      }
    }, 28);

    return () => {
      clearInterval(typingInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [activeTab]);

  // Handle auto tab cycler if idle
  useEffect(() => {
    const idleCycler = setInterval(() => {
      if (playbackStep === 'rendered') {
        // Shift tab after showing output for 6 seconds
        setTimeout(() => {
          setActiveTab(prev => (prev + 1) % 3);
        }, 5000);
      }
    }, 1000);

    return () => clearInterval(idleCycler);
  }, [playbackStep]);

  return (
    <div 
      id="cursor-portal-wrapper" 
      className={`min-h-screen transition-all duration-300 font-sans flex flex-col overflow-x-hidden md:py-0 ${
        isDarkMode 
          ? 'bg-neutral-950 text-neutral-100 selection:bg-neutral-100 selection:text-neutral-900' 
          : 'bg-[#f9f9f6] text-neutral-900 selection:bg-neutral-800 selection:text-neutral-100'
      }`}
    >
      
      {/* Navbar exactly like cursor.com */}
      <nav className={`border-b sticky top-0 z-50 px-6 sm:px-12 py-4 flex items-center justify-between transition-all select-none backdrop-blur-md ${
        isDarkMode 
          ? 'border-neutral-800/80 bg-neutral-955/90 text-neutral-100' 
          : 'border-neutral-200/60 bg-[#fcfcf9]/90 text-neutral-900'
      }`}>
        <div className="flex items-center gap-9">
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer font-bold tracking-tight group" onClick={onEnterIDE}>
            <div className="p-1 px-2.5 bg-neutral-900 text-white rounded-md font-mono text-sm tracking-tighter shadow-sm flex items-center justify-center transform group-hover:scale-105 transition-all">
              <span>{`C`}</span>
              <span className="text-sky-400 font-sans -ml-0.5 animate-pulse">⌘</span>
            </div>
            <span className={`font-extrabold text-lg font-sans leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Codex</span>
          </div>
 
          {/* Links centered for desktop */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold font-sans">
            <span className={`cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-450 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'}`}>{currentT.product}</span>
            <span className={`cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-450 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'}`}>{currentT.enterprise}</span>
            <span className={`cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-450 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'}`}>{currentT.pricing}</span>
            <span className={`cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-450 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'}`}>{currentT.resources}</span>
          </div>
        </div>
 
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className={`hidden sm:inline cursor-pointer transition-colors font-bold ${isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-950'}`}>{currentT.signIn}</span>
          <span className={`hidden md:inline cursor-pointer transition-colors font-bold ${isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-950'}`}>{currentT.contact}</span>
          
          {/* Language Selector Dropdown (Desktop) */}
          <div className="relative hidden xs:block select-none" id="lang-selector-root">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                isDarkMode
                  ? 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-sm'
              }`}
              id="lang-selector-trigger"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>{nativeLanguageNames[currentLang]}</span>
            </button>
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLangDropdown(false)} />
                <div className={`absolute right-0 mt-1.5 w-38 rounded-xl border p-1 shadow-xl z-50 flex flex-col gap-0.5 animate-slide-up ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 shadow-neutral-950/80' 
                    : 'bg-white border-neutral-200 text-neutral-700 shadow-neutral-100/80'
                }`}>
                  {(['en', 'zh', 'ja', 'zht', 'es', 'fr', 'pt', 'ko', 'de', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLang(lang);
                        setShowLangDropdown(false);
                      }}
                      className={`px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        currentLang === lang
                          ? (isDarkMode ? 'bg-neutral-800 text-white font-bold' : 'bg-neutral-100 text-neutral-900 font-bold')
                          : (isDarkMode ? 'hover:bg-neutral-800/60 text-neutral-400' : 'hover:bg-neutral-100/70 text-neutral-600')
                      }`}
                    >
                      <span>{nativeLanguageNames[lang]}</span>
                      {currentLang === lang && (
                        <span className="text-neutral-500 font-sans text-xs ml-2 select-none">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Mode Toggle Button (Desktop & Inline) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-center ${
              isDarkMode 
                ? 'bg-neutral-900 hover:bg-neutral-850 text-amber-400 border-neutral-800' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-sm'
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="theme-toggler-btn"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button 
            onClick={onEnterIDE}
            className={`hidden xs:flex items-center gap-1 px-3.5 py-2 rounded-lg font-bold shadow-md cursor-pointer transition-all hover:scale-102 hover:shadow-lg active:scale-98 ${
              isDarkMode
                ? 'bg-white hover:bg-neutral-100 text-neutral-950'
                : 'bg-neutral-950 hover:bg-neutral-800 text-[#fcfcf9]'
            }`}
          >
            <span>{currentT.openIDE}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
 
          {/* Mobile hamburger menu button with physical three menu lines as requested */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden flex flex-col justify-center items-center gap-1 w-8 h-8 rounded-lg transition-colors cursor-pointer focus:outline-none ${
              isDarkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'
            }`}
            aria-label="Toggle mobile menu"
          >
            <div className={`h-0.5 w-4.5 rounded-sm transition-all duration-300 ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-800'} ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`h-0.5 w-4.5 rounded-sm transition-all duration-300 ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-800'} ${isMenuOpen ? 'opacity-0 scale-90' : ''}`} />
            <div className={`h-0.5 w-4.5 rounded-sm transition-all duration-300 ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-800'} ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </nav>
 
      {/* Responsive Mobile Menu Panel with smooth overlay */}
      <div 
        className={`lg:hidden fixed inset-x-0 border-b z-45 transition-all duration-300 overflow-hidden shadow-xl ${
          isDarkMode
            ? 'bg-neutral-900/98 border-neutral-block border-neutral-800 text-neutral-100'
            : 'bg-[#fcfcf9]/98 border-neutral-200 text-neutral-900'
        } ${
          isMenuOpen ? 'top-[57px] max-h-[460px] opacity-100 py-6 px-6 backdrop-blur-md' : 'top-[57px] max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-4 text-xs font-bold tracking-tight uppercase text-left">
          <span className={`cursor-pointer py-2 border-b transition-colors ${isDarkMode ? 'hover:text-white border-neutral-800' : 'hover:text-neutral-950 border-neutral-100'}`} onClick={() => setIsMenuOpen(false)}>{currentT.product}</span>
          <span className={`cursor-pointer py-2 border-b transition-colors ${isDarkMode ? 'hover:text-white border-neutral-800' : 'hover:text-neutral-950 border-neutral-100'}`} onClick={() => setIsMenuOpen(false)}>{currentT.enterprise}</span>
          <span className={`cursor-pointer py-2 border-b transition-colors ${isDarkMode ? 'hover:text-white border-neutral-800' : 'hover:text-neutral-950 border-neutral-100'}`} onClick={() => setIsMenuOpen(false)}>{currentT.pricing}</span>
          <span className={`cursor-pointer py-2 border-b transition-colors ${isDarkMode ? 'hover:text-white border-neutral-800' : 'hover:text-neutral-950 border-neutral-100'}`} onClick={() => setIsMenuOpen(false)}>{currentT.resources}</span>
          
          <div className="flex gap-6 pt-2 font-semibold lowercase text-neutral-500 text-xs">
            <span className={`cursor-pointer hover:text-neutral-900 ${isDarkMode ? 'hover:text-white' : ''}`} onClick={() => setIsMenuOpen(false)}>{currentT.signIn}</span>
            <span className={`cursor-pointer hover:text-neutral-900 ${isDarkMode ? 'hover:text-white' : ''}`} onClick={() => setIsMenuOpen(false)}>{currentT.contact}</span>
          </div>
 
          {/* Mobile quick toggles */}
          <div className={`mt-2 pt-4 border-t flex items-center justify-between ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
              <div className="flex flex-wrap gap-1 max-w-[230px]">
                {(['en', 'zh', 'ja', 'zht', 'es', 'fr', 'pt', 'ko', 'de', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className={`px-1.5 py-0.5 text-[9px] rounded font-semibold cursor-pointer transition-all ${
                      currentLang === lang
                        ? (isDarkMode ? 'bg-neutral-800 text-white border border-neutral-700 font-bold' : 'bg-neutral-200 text-neutral-900 font-bold')
                        : 'text-neutral-500 hover:text-neutral-950'
                    }`}
                  >
                    {nativeLanguageNames[lang]}
                  </button>
                ))}
              </div>
            </div>
 
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-neutral-800 text-amber-400 border-neutral-700' 
                  : 'bg-white text-neutral-700 border-neutral-200 shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button 
            onClick={() => {
              setIsMenuOpen(false);
              onEnterIDE();
            }}
            className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-lg font-bold tracking-normal uppercase text-xs shadow-md mt-4 ${
              isDarkMode
                ? 'bg-white hover:bg-neutral-100 text-neutral-950'
                : 'bg-neutral-950 hover:bg-neutral-800 text-white'
            }`}
          >
            <span>{currentT.openIDE}</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
 
      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-12 flex flex-col items-center justify-center text-center max-w-5xl mx-auto select-none">
        
        {/* Release Pill Badge */}
        <div className={`inline-flex items-center gap-1.5 border text-[11px] font-bold px-3 py-1 rounded-full mb-6 shadow-sm select-none transition-colors ${
          isDarkMode
            ? 'bg-sky-950/40 border-sky-900/60 text-sky-300'
            : 'bg-sky-50 border-sky-200/50 text-sky-700'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-sky-500 fill-sky-200 animate-spin-slow" />
          <span>{currentT.heroBadge}</span>
        </div>
 
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] max-w-3xl mb-6 transition-colors ${
          isDarkMode ? 'text-white' : 'text-neutral-900'
        }`}>
          {currentT.heroTitle}
        </h1>
 
        <p className={`text-sm sm:text-base md:text-lg max-w-2xl font-medium tracking-normal mb-8 leading-relaxed transition-colors ${
          isDarkMode ? 'text-neutral-400' : 'text-slate-600'
        }`}>
          {currentT.heroSubtitle}
        </p>
 
        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={onEnterIDE}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-lg font-bold text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-102 ${
              isDarkMode
                ? 'bg-white hover:bg-neutral-100 text-neutral-950'
                : 'bg-neutral-950 hover:bg-neutral-800 text-white'
            }`}
          >
            <span>{currentT.getStarted}</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
          
          <button 
            onClick={() => {
              const element = document.getElementById('high-fidelity-composer-mock');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm tracking-tight transition-all cursor-pointer hover:scale-102 ${
              isDarkMode
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
                : 'bg-neutral-200/70 hover:bg-neutral-200/90 text-neutral-800'
            }`}
          >
            <span>{currentT.watchLive}</span>
            <Play className={`w-3.5 h-3.5 ${isDarkMode ? 'fill-neutral-300' : 'fill-neutral-800'}`} />
          </button>
        </div>
 
      </section>
 
      {/* Main High-Fidelity Cursor Desktop Mockup */}
      <section id="high-fidelity-composer-mock" className="px-4 sm:px-8 md:px-12 pb-24 max-w-6xl mx-auto w-full flex flex-col items-center">
        
        {/* Project Selector tabs above the mockup to drive the interactive demo */}
        <div className={`flex items-center p-1.5 rounded-xl mb-6 shadow-sm select-none gap-1 border transition-all ${
          isDarkMode 
            ? 'bg-neutral-900 border-neutral-800' 
            : 'bg-[#f2f2ef] border-neutral-200/70'
        }`}>
          <button
            onClick={() => setActiveTab(0)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
              activeTab === 0 
                ? (isDarkMode 
                    ? 'bg-neutral-850 text-white border border-neutral-700 shadow-md' 
                    : 'bg-white text-neutral-900 border border-neutral-200/50 shadow-md')
                : (isDarkMode ? 'text-neutral-450 hover:text-neutral-250' : 'text-neutral-500 hover:text-neutral-800')
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>{currentT.gravityOrbits}</span>
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
              activeTab === 1 
                ? (isDarkMode 
                    ? 'bg-neutral-850 text-white border border-neutral-700 shadow-md' 
                    : 'bg-white text-neutral-900 border border-neutral-200/50 shadow-md')
                : (isDarkMode ? 'text-neutral-450 hover:text-neutral-250' : 'text-neutral-500 hover:text-neutral-800')
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>{currentT.slideCarousel}</span>
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
              activeTab === 2 
                ? (isDarkMode 
                    ? 'bg-neutral-850 text-white border border-neutral-700 shadow-md' 
                    : 'bg-white text-neutral-900 border border-neutral-200/50 shadow-md')
                : (isDarkMode ? 'text-neutral-450 hover:text-neutral-250' : 'text-neutral-500 hover:text-neutral-800')
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>{currentT.interactivePlanner}</span>
          </button>
        </div>

        {/* Chassis of Desktop Simulator */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col select-none relative focus-within:ring-2 focus-within:ring-sky-500/20">
          
          {/* Top Window Bar */}
          <div className="h-11 bg-neutral-900/90 border-b border-neutral-800 px-4 flex items-center justify-between select-none shrink-0">
            <div className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-rose-500 block border border-rose-600/30"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 block border border-amber-600/30"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 block border border-emerald-600/30"></span>
            </div>
            
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-1.5 select-none">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              Codex Desktop - Composer v2
            </span>

            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400">
                PORT 3000
              </span>
            </div>
          </div>

          {/* Three-Column IDE Workspace simulation */}
          <div className="flex h-[430px] min-h-[430px] w-full bg-neutral-950 overflow-hidden leading-normal text-left items-stretch select-none">
            
            {/* Sidebar Column (Left) */}
            <div className="w-48 bg-neutral-950 border-r border-neutral-800/80 p-3.5 flex flex-col justify-between select-none shrink-0 hidden md:flex">
              <div>
                <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase block mb-3 select-none">
                  Agent Pipelines
                </span>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 p-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0"></span>
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-bold text-neutral-200 leading-none truncate">Analyze codebase</span>
                      <span className="text-[8px] text-neutral-500 mt-0.5">Fetching dependencies</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-900/30 border border-transparent p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-bold text-neutral-400 leading-none">Compile index</span>
                      <span className="text-[8px] text-neutral-600">Done in 1.4s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-900/30 border border-transparent p-2 rounded-lg opacity-60">
                    <CheckCircle2 className="w-4 h-4 text-neutral-700 shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-bold text-neutral-500 leading-none">Staging host</span>
                      <span className="text-[8px] text-neutral-600">Standby</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-900 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold uppercase mb-1">
                  <span>Engine Branch</span>
                  <GitBranch className="w-2.5 h-2.5" />
                </div>
                <span className="font-mono text-[10px] font-semibold text-sky-400 tracking-tight">main-agent-v2</span>
              </div>
            </div>

            {/* AI composer chat column (Middle) */}
            <div className="flex-1 bg-neutral-950/80 p-4 border-r border-neutral-800/80 flex flex-col justify-between overflow-hidden relative select-none">
              <div className="flex-1 pr-1 overflow-y-auto space-y-4">
                
                {/* Simulated User Speech bubble */}
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 font-bold text-[9px] flex items-center justify-center text-neutral-300 pointer-events-none uppercase shrink-0">
                    ME
                  </div>
                  <div className="flex-1 bg-neutral-900/90 border border-neutral-800/60 p-3 rounded-xl max-w-sm">
                    <p className="text-xs text-neutral-200 tracking-tight leading-relaxed select-text select-all whitespace-pre-line font-medium min-h-[30px]">
                      {typedPrompt || " "}
                      {playbackStep === 'typing' && <span className="inline-block w-1.5 h-3 bg-sky-400 ml-0.5 animate-pulse"></span>}
                    </p>
                  </div>
                </div>

                {/* Simulated AI Agent Reply thought-loop */}
                {playbackStep !== 'typing' && (
                  <div className="flex gap-2.5 animate-fade-in">
                    <div className="w-5 h-5 rounded-full bg-sky-500 border border-sky-400 font-bold text-[9px] flex items-center justify-center text-white pointer-events-none uppercase shrink-0">
                      AI
                    </div>
                    <div className="flex-1 space-y-3 max-w-md select-none">
                      
                      {/* Thought ticker */}
                      <div className="bg-neutral-900/40 border border-neutral-800/75 p-2 px-3 rounded-lg text-xs leading-relaxed select-none">
                        <div className="flex items-center justify-between mb-1.5 border-b border-neutral-900 pb-1 text-[10px] text-neutral-400">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
                            Thinking Loop
                          </span>
                          <span className="font-mono text-sky-400 font-black">{thinkTimer}s</span>
                        </div>
                        <ul className="space-y-1.5 text-[10px] font-sans font-medium text-neutral-400 pr-1">
                          {tabScenarios[activeTab].thoughts.slice(0, playbackStep === 'thinking' ? 2 : 4).map((thought, idx) => (
                            <li key={idx} className="flex gap-1.5 items-start">
                              <span className="text-sky-500">✓</span>
                              <span className="flex-1 leading-normal">{thought}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* File patched line logs */}
                      {(playbackStep === 'writing' || playbackStep === 'rendered') && (
                        <div className="flex items-center justify-between text-[11px] font-mono bg-neutral-900 border border-neutral-800/80 px-3 py-2 rounded-lg text-emerald-400/90 shadow-sm animate-fade-in font-semibold">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
                            Patched {currentFilePatched}
                          </span>
                          <span className="text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 px-1.5 py-0.5 rounded shrink-0">
                            {tabScenarios[activeTab].stats}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* Bottom dummy workspace command line input dock */}
              <div className="border-t border-neutral-900 pt-3 relative">
                <div className="inline-flex py-1 px-2.5 bg-neutral-900 border border-neutral-850 rounded-lg text-[9px] text-neutral-500 font-bold uppercase select-none tracking-wider absolute -top-3.5 left-4">
                  COMPOSER v2 PROMPT
                </div>
                <div className="bg-neutral-900/70 border border-neutral-800/60 p-2.5 rounded-xl flex items-center justify-between text-xs text-neutral-400 select-none">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sky-400 font-black">⌘K</span>
                    <span className="truncate pr-1 text-neutral-600 font-medium">Ask for commands, file updates, or full layouts...</span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500 shrink-0 font-mono">Agent-Native</span>
                </div>
              </div>

            </div>

            {/* Simulated Live View screen container (Right) */}
            <div className="w-[320px] max-w-[320px] bg-neutral-950 flex flex-col items-stretch overflow-hidden select-none shrink-0 border-l border-neutral-850">
              
              {/* Virtual URL input line */}
              <div className="h-8 bg-neutral-900 border-b border-neutral-800 px-3.5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 block"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 block"></span>
                </div>
                
                <div className="flex-1 max-w-xs bg-neutral-950 text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded border border-neutral-850 truncate text-center font-medium">
                  http://localhost:3000
                </div>

                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <RefreshCw className="w-2.5 h-2.5 text-neutral-600" />
                </div>
              </div>

              {/* Display either loading background or the fully active simulation in real-time */}
              <div className="flex-1 bg-neutral-950 relative overflow-hidden flex items-stretch">
                {playbackStep === 'rendered' ? (
                  <div className="flex-1 animate-fade-in relative">
                    {activeTab === 0 && <OrbitDemoSimulation />}
                    {activeTab === 1 && <CarouselDemoSimulation />}
                    {activeTab === 2 && <InteractiveNotesWidget />}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-3 items-center justify-center p-6 text-center text-neutral-500 grayscale select-none bg-neutral-950">
                    <div className="p-3 bg-neutral-900 rounded-full border border-neutral-800 animate-spin">
                      <RefreshCw className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col gap-1 select-none">
                      <span className="text-[11px] font-bold text-neutral-400 tracking-tight uppercase">Compiling Static Assets</span>
                      <span className="text-[9px] text-neutral-600 tracking-normal leading-relaxed">
                        {statusText}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Trusted brand logo wall section identically modeled after the screenshot */}
      <section className="bg-[#f2f2ef] border-y border-neutral-250 py-10 w-full select-none">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest mb-6 leading-tight">
            {currentT.trustedBy}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-82 md:gap-x-14">
            <span className="text-lg md:text-xl font-bold font-sans tracking-tighter text-neutral-500 hover:text-neutral-800 transition-colors">stripe</span>
            <span className="text-base md:text-lg font-black font-mono tracking-tight text-neutral-500 hover:text-neutral-800 transition-colors">OpenAI</span>
            <span className="text-base md:text-lg font-black font-sans italic tracking-tighter text-neutral-500 hover:text-neutral-800 transition-colors">Linear</span>
            <span className="text-sm md:text-base font-extrabold font-mono tracking-widest text-neutral-500 hover:text-neutral-800 transition-colors">DATADOG</span>
            <span className="text-base md:text-lg font-black font-sans uppercase tracking-tight text-neutral-500 hover:text-neutral-800 transition-colors">NVIDIA</span>
            <span className="text-base md:text-lg font-black font-mono tracking-tighter text-neutral-500 hover:text-neutral-800 transition-colors">Figma</span>
            <span className="text-base md:text-lg font-extrabold font-sans italic tracking-tighter text-neutral-500 hover:text-neutral-800 transition-colors">ramp</span>
            <span className="text-base md:text-lg font-bold font-sans text-neutral-500 hover:text-neutral-800 transition-colors">Adobe</span>
          </div>
        </div>
      </section>

      {/* Feature Section: Agents turn ideas into code */}
      <section className="max-w-5xl mx-auto px-6 py-20 select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5 text-left md:pr-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              {currentT.agentsTitle}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {currentT.agentsSubtitle}
            </p>
            <button 
              onClick={onEnterIDE}
              className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-bold hover:text-sky-850 transition-colors group cursor-pointer"
            >
              <span>{currentT.learnAgentNative}</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Interactive Checkbox simulation box */}
          <div className="bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{currentT.agentLogsTitle}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">{currentT.activePill}</span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start p-3 bg-neutral-50/60 border border-neutral-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-800">{currentT.scen1}</span>
                  <p className="text-[10px] text-neutral-500">{currentT.scen1Sub}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start p-3 bg-neutral-50/60 border border-neutral-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-800">{currentT.scen2}</span>
                  <p className="text-[10px] text-neutral-500">{currentT.scen2Sub}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start p-3 bg-neutral-50/60 border border-neutral-150 rounded-xl animate-pulse">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-sky-200">
                  3
                </span>
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-800">{currentT.scen3}</span>
                  <p className="text-[10px] text-neutral-500">{currentT.scen3Sub}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Works autonomously */}
      <section className="bg-[#fbfbf9] border-t border-neutral-250 py-20 w-full select-none">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="order-2 md:order-1 bg-neutral-950 border border-neutral-850 p-5 rounded-2xl shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></span>
                  {currentT.multiCoreConsole}
                </span>
                <span className="text-[8px] text-neutral-500">{currentT.systemRecap}</span>
              </div>

              <div className="space-y-3 text-left">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-300 font-bold">{currentT.worker1}</span>
                    <span className="text-[8px] bg-sky-950 text-sky-450 px-1 rounded">{currentT.runningStatus}</span>
                  </div>
                  <div className="w-full bg-neutral-950 rounded-full h-1">
                    <div className="bg-sky-400 h-1 rounded-full w-2/3 animate-pulse"></div>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-900 border border-neutral-800/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-300 font-bold">{currentT.worker2}</span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 rounded">{currentT.doneStatus}</span>
                  </div>
                  <div className="w-full bg-neutral-950 rounded-full h-1">
                    <div className="bg-emerald-400 h-1 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-900 border border-neutral-800/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-350 font-bold">{currentT.worker3}</span>
                    <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1 rounded">{currentT.standbyStatus}</span>
                  </div>
                  <div className="w-full bg-neutral-950 rounded-full h-1">
                    <div className="bg-neutral-800 h-1 rounded-full w-1/12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-5 text-left md:pl-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {currentT.worksAutonomously}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                {currentT.worksSubtitle}
              </p>
              <button 
                onClick={onEnterIDE}
                className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-bold hover:text-sky-850 transition-colors group cursor-pointer"
              >
                <span>{currentT.learnCloudWorkers}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        </div>
      </section>
      <section className="bg-white border-t border-neutral-200 py-20 w-full select-none text-neutral-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            
            <div className="space-y-5 text-left md:pr-4">
              <span className="text-sky-600 font-bold uppercase tracking-wider text-[10px] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/50">{currentT.integrationsBadge}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {currentT.integrationsTitle}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                {currentT.integrationsSubtitle}
              </p>
              
              {/* Terminal installation command box */}
              <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-3.5 max-w-sm flex items-center justify-between font-mono text-[10.5px] text-neutral-700 font-bold shadow-sm overflow-hidden select-all font-semibold">
                <span className="truncate pr-2 font-mono">curl https://codex.dev/install.sh | sh</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("curl https://codex.dev/install.sh | sh");
                  }}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white rounded px-2.5 py-1 text-[9px] font-bold tracking-tight shrink-0 cursor-pointer shadow-sm active:scale-98 font-sans"
                >
                  {currentT.terminalCopy}
                </button>
              </div>
            </div>

            {/* Slack simulation notification panel */}
            <div className="bg-neutral-950 border border-neutral-850 p-5 rounded-2xl shadow-xl space-y-4 text-left font-sans">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase tracking-widest">{currentT.slackChatCollab}</span>
              </div>
              
              <div className="space-y-4 font-sans text-xs">
                {/* Developer message */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-6.5 h-6.5 rounded-md bg-stone-850 flex items-center justify-center font-mono text-[10px] font-black text-rose-450 shrink-0">SW</div>
                  <div>
                    <div className="flex items-baseline gap-1.5 animate-fade-in text-neutral-300">
                      <span className="text-[11px] font-bold">swhitmore</span>
                      <span className="text-[8px] text-neutral-600 font-medium">5m ago</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-normal">
                      Is there any easy way to connect gravity sandbox friction modifiers to secondary sliders? <span className="text-sky-450 font-bold">@codex</span> can you take a stab?
                    </p>
                  </div>
                </div>

                {/* Codex agent action response */}
                <div className="flex gap-2.5 items-start pl-3 border-l-2 border-sky-500/40">
                  <div className="w-6.5 h-6.5 rounded-md bg-sky-500 flex items-center justify-center font-bold text-[10px] text-white shrink-0 font-sans">C</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-bold text-neutral-200">codex-agent</span>
                      <span className="text-[8px] text-sky-400 uppercase font-black tracking-widest px-1 py-0.5 bg-sky-955/40 rounded border border-sky-900/40">agent app</span>
                    </div>
                    
                    <div className="bg-neutral-900 border border-neutral-850/80 rounded-lg p-2.5 text-[9.5px] text-neutral-400 font-mono space-y-1">
                      <div className="flex justify-between items-center text-sky-400 font-bold">
                        <span>● Read 3 files, 1 search</span>
                        <span>1s</span>
                      </div>
                      <div className="text-neutral-500 font-semibold">● Planned 2s</div>
                      <div className="text-neutral-500 font-semibold">● Read 2 files, 1 directory 1s</div>
                      <div className="pt-1.5 border-t border-neutral-850/50 mt-1.5 pb-1">
                        <span className="text-neutral-300 font-bold font-sans text-[10px]">Question:</span>
                        <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">What data should the friction display coordinates render?</p>
                      </div>
                      <div className="flex gap-1.5 mt-1.5 font-sans">
                        <span className="bg-sky-900/40 border border-sky-900/65 text-[8px] text-sky-300 px-1.5 py-0.5 rounded font-black">[X] Real-time metrics</span>
                        <span className="bg-neutral-950 border border-neutral-850 text-[8px] text-neutral-500 px-1.5 py-0.5 rounded font-bold">[ ] System status</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section 4: Magically accurate autocomplete */}
      <section className="bg-[#fbfbf9] border-t border-neutral-250 py-20 w-full select-none text-neutral-900">
        <div className="max-w-5xl mx-auto px-6 font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            
            {/* Editor predictor preview mockup panel */}
            <div className="order-2 md:order-1 bg-neutral-950 border border-neutral-850 p-4 rounded-xl shadow-xl font-mono leading-relaxed text-xs">
              <div className="flex items-center gap-1.5 border-b border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] text-neutral-500 font-bold">Dashboard.tsx</span>
                <span className="bg-neutral-900 border border-neutral-850 px-1.5 py-0.5 rounded text-[8px] text-sky-400 uppercase font-bold ml-auto select-none font-sans">Predictive Tab</span>
              </div>
              
              <div className="text-left space-y-1 font-mono text-[10.5px]">
                <div className="text-neutral-500 font-semibold"><span className="text-sky-400">import</span> React, &#123; useState &#125; <span className="text-sky-400">from</span> <span className="text-amber-300">"react"</span>;</div>
                <div className="text-neutral-500 font-semibold"><span className="text-sky-400">import</span> &#123; LineChart &#125; <span className="text-sky-400">from</span> <span className="text-amber-300">"recharts"</span>;</div>
                <div className="text-neutral-300"><span className="text-sky-400">export default function</span> <span className="text-emerald-300 font-semibold">Dashboard</span>() &#123;</div>
                <div className="pl-4 text-neutral-300"><span className="text-sky-400">const</span> [active, setActive] = <span className="text-emerald-300 font-semibold">useState</span>(<span className="text-amber-300">true</span>);</div>
                
                {/* Autocomplete predictive inline gray suggestion */}
                <div className="pl-4 flex items-center bg-neutral-900/60 border border-neutral-850/45 rounded py-0.5 px-2 my-1">
                  <span className="text-sky-400 font-bold">const</span>&nbsp;<span className="text-neutral-550 font-semibold">toggleActive = () =&gt; setActive(prev =&gt; !prev);</span>
                  <span className="bg-sky-500 text-neutral-950 font-black px-1.5 py-0.5 rounded text-[7.5px] ml-2 animate-pulse font-sans">TAB</span>
                </div>
                
                <div className="pl-4 text-neutral-500">return (</div>
                <div className="pl-8 text-neutral-500">&lt;<span className="text-sky-400">div</span> className=<span className="text-amber-300">"flex cursor-pointer"</span> onClick=&#123;toggleActive&#125;&gt;</div>
                <div className="pl-12 text-neutral-500">&lt;<span className="text-sky-400">span</span>&gt;Active System State&lt;/<span className="text-sky-400">span</span>&gt;</div>
                <div className="pl-8 text-neutral-500">&lt;/<span className="text-sky-400">div</span>&gt;</div>
                <div className="pl-4 text-neutral-500">);</div>
                <div className="text-neutral-300">&#125;</div>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-5 text-left md:pl-4 font-sans">
              <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/50">Predictive Intelligence</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                Magically accurate autocomplete.
              </h2>
              <p className="text-slate-650 text-sm leading-relaxed font-semibold">
                Our specialized Tab model predicts your next action with striking speed and precision. Powered by contextual codebase comprehension, it anticipates blocks of code, variables, and imports as fast as you can think.
              </p>
              <button 
                onClick={onEnterIDE}
                className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-bold hover:text-sky-850 transition-colors group cursor-pointer"
              >
                <span>Learn about predictive Tab model</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Grid exactly modeled after the screenshot */}
      <section className="bg-neutral-50 border-t border-neutral-250 py-24 select-none w-full text-center text-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-955 tracking-tight mb-2 leading-none">
            The new way to build software.
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-xs sm:text-sm tracking-normal mb-14 leading-normal font-semibold mt-1">
            Read stories from legendary engineers, founders, and creators accelerating their shipping velocity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
            
            {/* Card 1: Diana Hu */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all">
              <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6 font-sans">
                "It was night and day from one batch to another, adoption went from single digits to over 80%. It just spread like wildfire, all the best builders were using Codex."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">DH</div>
                <div className="text-left leading-none font-sans">
                  <div className="text-xs font-extrabold text-neutral-900">Diana Hu</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">General Partner, Y Combinator</span>
                </div>
              </div>
            </div>

            {/* Card 2: Jensen Huang */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all">
              <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6 font-sans">
                "My favorite enterprise AI service is Codex. Every one of our engineers, some 40,000, are now assisted by AI and our productivity has gone up incredibly."
              </p>
              <div className="flex items-center gap-3 font-sans">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-400 to-emerald-650 flex items-center justify-center font-bold text-xs text-white">JH</div>
                <div className="text-left leading-none font-sans">
                  <div className="text-xs font-extrabold text-neutral-900">Jensen Huang</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">President & CEO, NVIDIA</span>
                </div>
              </div>
            </div>

            {/* Card 3: Andrej Karpathy */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all">
              <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6 font-sans">
                "The best LLM applications have an autonomy slider: you control how much independence to give the AI. In Codex, you can do Tab completion, Cmd+K for targeted updates..."
              </p>
              <div className="flex items-center gap-3 font-sans">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-605 flex items-center justify-center font-bold text-xs text-white">AK</div>
                <div className="text-left leading-none font-sans">
                  <div className="text-xs font-extrabold text-neutral-900">Andrej Karpathy</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">CEO, Eureka Labs</span>
                </div>
              </div>
            </div>

            {/* Card 4: Patrick Collison */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all font-sans">
              <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6">
                "Codex quickly grew from hundreds to thousands of extremely enthusiastic Stripe employees. We spend more on R&D and software creation than any other undertaking..."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-505 flex items-center justify-center font-bold text-xs text-white font-sans">PC</div>
                <div className="text-left leading-none">
                  <div className="text-xs font-extrabold text-neutral-900">Patrick Collison</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">Co-Founder & CEO, Stripe</span>
                </div>
              </div>
            </div>

            {/* Card 5: shadcn */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all font-sans">
              <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6 font-sans">
                "The most useful AI tool that I currently pay for, hands down, is Codex. It's fast, autocompletes when and where you need it to, handles brackets properly, sensible keyboard shortcuts..."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-fuchsia-600 flex items-center justify-center font-bold text-xs text-white font-sans">S</div>
                <div className="text-left leading-none">
                  <div className="text-xs font-extrabold text-neutral-900">shadcn</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">Creator of shadcn/ui</span>
                </div>
              </div>
            </div>

            {/* Card 6: Greg Brockman */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-all font-sans">
              <p className="text-neutral-605 text-xs font-semibold leading-relaxed mb-6">
                "It's definitely becoming more fun to be a programmer. We are at the 1% of what's possible, and it's in interactive experiences like Codex where models shine brightest."
              </p>
              <div className="flex items-center gap-3 font-sans">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-600 flex items-center justify-center font-bold text-xs text-white">GB</div>
                <div className="text-left leading-none font-sans">
                  <div className="text-xs font-extrabold text-neutral-900">Greg Brockman</div>
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">President, OpenAI</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Frontier Models Section exactly modeled after the screenshot */}
      <section className="bg-white border-t border-neutral-250 py-24 select-none w-full text-center text-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight text-left mb-10 leading-none">
            Stay on the frontier
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Widget 1: Model selector */}
            <div className="bg-[#fcfcf9] border border-neutral-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-visible h-full font-sans">
              <div className="space-y-3.5 mb-8">
                <h3 className="text-md sm:text-lg font-extrabold text-neutral-900 tracking-tight">Use the best model for every task</h3>
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed max-w-sm">
                  Choose between every cutting-edge model from OpenAI, Anthropic, Gemini, xAI, and Codex.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-orange-650 hover:text-orange-850 font-bold font-sans cursor-pointer transition-all">
                    Explore models ↗
                  </span>
                </div>
              </div>

              {/* Interactive model selector mockup dropdown widget */}
              <div className="bg-neutral-100 border border-neutral-200 p-6 rounded-xl flex items-center justify-center min-h-[220px] relative">
                <div className="w-full max-w-xs relative bg-white border border-neutral-200 rounded-xl shadow-lg p-3.5 space-y-3.5 select-none text-left z-20 font-sans">
                  <div className="text-[9.5px] font-black text-neutral-400 uppercase tracking-wider">
                    Select Model Engine
                  </div>
                  
                  {/* Selector Header Bar */}
                  <button 
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="w-full flex items-center justify-between border border-neutral-200 hover:border-neutral-300 bg-neutral-50 p-2.5 rounded-lg text-xs font-bold text-neutral-800 cursor-pointer transition-all focus:outline-none font-sans"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-orange-500" />
                      <span>{selectedModel}</span>
                      <span className="text-[7.5px] bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">Active</span>
                    </div>
                    <span className="text-neutral-500 text-[9px]">{showModelDropdown ? '▲' : '▼'}</span>
                  </button>

                  {/* Dropdown list */}
                  {showModelDropdown && (
                    <div className="absolute left-3.5 right-3.5 top-[74px] bg-white border border-neutral-200 rounded-lg shadow-md divide-y divide-neutral-100 overflow-hidden transition-all z-30 font-sans">
                      <div 
                        onClick={() => { setSelectedModel("Auto (Suggested)"); setShowModelDropdown(false); }} 
                        className={`p-2.5 hover:bg-neutral-50 text-xs cursor-pointer flex items-center justify-between ${selectedModel === "Auto (Suggested)" ? 'bg-orange-50/45 text-orange-600 font-bold' : 'text-neutral-600'}`}
                      >
                        <span>Auto <span className="text-[8px] text-neutral-400 font-medium ml-1">Suggested</span></span>
                        {selectedModel === "Auto (Suggested)" && <span className="text-orange-600 font-bold">✓</span>}
                      </div>

                      <div 
                        onClick={() => { setSelectedModel("Composer 2.5"); setShowModelDropdown(false); }} 
                        className={`p-2.5 hover:bg-neutral-50 text-xs cursor-pointer flex items-center justify-between ${selectedModel === "Composer 2.5" ? 'bg-orange-50/45 text-orange-600 font-bold' : 'text-neutral-600'}`}
                      >
                        <span>Composer 2.5</span>
                        {selectedModel === "Composer 2.5" && <span className="text-orange-600 font-bold">✓</span>}
                      </div>

                      <div 
                        onClick={() => { setSelectedModel("GPT-5.5"); setShowModelDropdown(false); }} 
                        className={`p-2.5 hover:bg-neutral-50 text-xs cursor-pointer flex items-center justify-between ${selectedModel === "GPT-5.5" ? 'bg-orange-50/45 text-orange-600 font-bold' : 'text-neutral-600'}`}
                      >
                        <span>GPT-5.5</span>
                        {selectedModel === "GPT-5.5" && <span className="text-orange-600 font-bold">✓</span>}
                      </div>

                      <div 
                        onClick={() => { setSelectedModel("Opus 4.8"); setShowModelDropdown(false); }} 
                        className={`p-2.5 hover:bg-neutral-50 text-xs cursor-pointer flex items-center justify-between ${selectedModel === "Opus 4.8" ? 'bg-orange-50/45 text-orange-600 font-bold' : 'text-neutral-600'}`}
                      >
                        <span>Opus 4.8</span>
                        {selectedModel === "Opus 4.8" && <span className="text-orange-600 font-bold">✓</span>}
                      </div>

                      <div 
                        onClick={() => { setSelectedModel("Gemini 3.1 Pro"); setShowModelDropdown(false); }} 
                        className={`p-2.5 hover:bg-neutral-50 text-xs cursor-pointer flex items-center justify-between ${selectedModel === "Gemini 3.1 Pro" ? 'bg-orange-50/45 text-orange-600 font-bold' : 'text-neutral-600'}`}
                      >
                        <span>Gemini 3.1 Pro</span>
                        {selectedModel === "Gemini 3.1 Pro" && <span className="text-orange-600 font-bold">✓</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Widget 2: Codebase understanding */}
            <div className="bg-[#fcfcf9] border border-neutral-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
              <div className="space-y-3.5 mb-8">
                <h3 className="text-md sm:text-lg font-extrabold text-neutral-900 tracking-tight">Complete codebase understanding</h3>
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed max-w-sm">
                  Codex learns how your codebase works, no matter the scale or complexity, mapping full dependencies instantly.
                </p>
                <div className="pt-2 font-sans">
                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-850 font-bold cursor-pointer transition-all">
                    Learn about codebase indexing ↗
                  </span>
                </div>
              </div>

              {/* Codebase search index terminal mockup */}
              <div className="bg-neutral-100 border border-neutral-200 p-5 rounded-xl flex items-center justify-center min-h-[220px]">
                <div className="w-full bg-neutral-950 text-neutral-400 font-mono text-[9.5px] rounded-xl border border-neutral-850 p-4 leading-normal select-none relative space-y-3">
                  <div className="flex justify-between items-center text-[8px] text-neutral-550 border-b border-neutral-900 pb-2 font-bold uppercase select-none tracking-wider font-sans">
                    <span>Indexed Code Chunks</span>
                    <span className="text-emerald-400 font-black">● 100% Security Sandbox</span>
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center bg-neutral-900/50 border border-neutral-850/60 p-2 rounded-lg leading-none">
                      <span className="text-neutral-300 font-semibold truncate leading-none">🔍 Search: "Where are these menu label colors defined?"</span>
                    </div>
                    <div className="text-neutral-500 pl-1 space-y-1.5 text-[9px] leading-relaxed">
                      <div className="flex gap-2 text-sky-400 font-bold">
                        <span>→ /src/App.tsx</span> 
                        <span className="text-neutral-600 font-semibold">| Matches class declaration leading menu text</span>
                      </div>
                      <div className="flex gap-2 text-sky-400 font-bold">
                        <span>→ /src/components/CursorLandingPage.tsx:422</span>
                        <span className="text-neutral-600 font-semibold font-sans">| Nav header elements defined explicitly</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enduring software full screen editor mockups */}
      <section className={`border-t py-24 select-none w-full text-center transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950/20 border-neutral-800 text-neutral-100' 
          : 'bg-[#fcfcf9] border-neutral-250 text-neutral-900'
      }`}>
        <div className="max-w-5xl mx-auto px-6 text-left space-y-8">
          <div className="space-y-4 font-sans">
            <span className={`font-black uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-full border ${
              isDarkMode 
                ? 'text-amber-400 bg-amber-955/20 border-amber-900/40' 
                : 'text-amber-700 bg-amber-50 border-amber-200/50'
            }`}>Enterprise Ready</span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              Develop enduring software.
            </h2>
            <p className={`text-sm max-w-xl font-semibold leading-relaxed ${
              isDarkMode ? 'text-neutral-450' : 'text-slate-655'
            }`}>
              Trusted by over half of the Fortune 550 to accelerate development securely, ensuring custom auth rules, strict enterprise network boundaries, and scalable virtual memory.
            </p>
            <div>
              <span className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-850 font-bold group cursor-pointer font-semibold transition-all">
                <span>Explore enterprise capabilities</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>

          {/* Majestic full width Code file mockup */}
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl shadow-2xl overflow-hidden font-mono">
            <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-850 flex items-center justify-between text-[10px] font-bold text-neutral-500 font-sans">
              <div className="flex gap-1.5 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
              </div>
              <span className="font-mono">core/auth-middleware.ts</span>
              <span className="text-[8.5px] bg-neutral-955 px-2 py-0.5 rounded text-sky-400 border border-neutral-850 tracking-wider font-bold">TS</span>
            </div>

            <pre className="p-6 text-xs text-neutral-400 font-mono overflow-x-auto whitespace-pre leading-relaxed font-semibold text-left select-all">
{`343:   const authenticateTokenHeader = (req: Request, res: Response, next: NextFunction) => {
344:     const authorizationHeader = req.headers['authorization'];
345:     const parsedToken = authorizationHeader && authorizationHeader.split(' ')[1];
346: 
347:     for (let _i = 0, _length = whitelist_subnets_ipv4.length; _i < _length; _i++) {
348:       const activeNetworkSubnet = whitelist_subnets_ipv4[_i];
349:       if (req.ip.compareSubnetCheck(activeNetworkSubnet)) {
350:         return next();
351:       }
352:     }
353: 
354:     if (!parsedToken) return res.status(httpStatus.UNAUTHORIZED).json({ error: "Missing token" });
355: 
356:     jwt.verify(parsedToken, process.env.JWT_SECRET as string, (err, user) => {
357:       if (err) return res.status(httpStatus.FORBIDDEN).json({ error: "Invalid token" });
358:       req.user = user;
359:       next();
360:     });
361:   };`}
            </pre>
          </div>
        </div>
      </section>

      {/* Changelog grid layout */}
      <section className={`border-t py-24 select-none w-full text-center transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950 border-neutral-800 text-neutral-100' 
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}>
        <div className="max-w-5xl mx-auto px-6 text-left">
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-neutral-955'}`}>
            Changelog
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-1 font-sans">
            <div className="bg-[#fcfcf9] border border-neutral-200/80 p-5 rounded-2xl flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="space-y-2 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black bg-neutral-900 text-white rounded px-2 py-0.5 font-mono">3.6</span>
                  <span className="text-[10px] text-neutral-400 font-bold">May 29, 2026</span>
                </div>
                <h3 className="text-sm font-extrabold text-neutral-800">Auto-review Run Mode</h3>
                <p className="text-[11px] text-neutral-500 font-semibold leading-normal">
                  Toggle immediate PR audits, security check assertions, and automatic lint fixes directly on live servers.
                </p>
              </div>
            </div>

            <div className="bg-[#fcfcf9] border border-neutral-200/80 p-5 rounded-2xl flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="space-y-2 font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <span className="text-[10px] uppercase font-black bg-neutral-900 text-white rounded px-2 py-0.5 font-mono">3.5</span>
                  <span className="text-[10px] text-neutral-400 font-bold">May 20, 2026</span>
                </div>
                <h3 className="text-sm font-extrabold text-neutral-800">Shared Canvases and /loop Skill</h3>
                <p className="text-[11px] text-neutral-500 font-semibold leading-normal">
                  Let multi-core agents stream drawings, canvas vectors, and loop feedback iteratively inside the preview window.
                </p>
              </div>
            </div>

            <div className="bg-[#fcfcf9] border border-neutral-200/80 p-5 rounded-2xl flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="space-y-2 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black bg-neutral-900 text-white rounded px-2 py-0.5 font-mono">3.4</span>
                  <span className="text-[10px] text-neutral-400 font-bold font-sans">May 12, 2026</span>
                </div>
                <h3 className="text-sm font-extrabold text-neutral-800">Improvements to Codex Automations</h3>
                <p className="text-[11px] text-neutral-500 font-semibold leading-normal font-sans">
                  Refined background compilations, hot swapping, and enhanced file reading speeds for code bases exceeding 1M lines.
                </p>
              </div>
            </div>
          </div>

          <div className="font-sans">
            <span className="inline-flex items-center gap-1 text-xs text-sky-600 font-bold hover:text-sky-850 cursor-pointer transition-all">
              <span>See what's new in Codex</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Applied Research team card setup */}
      <section className={`border-t py-20 w-full select-none transition-colors ${
        isDarkMode 
          ? 'bg-neutral-900/20 border-neutral-800 text-neutral-100' 
          : 'bg-stone-50 border-neutral-200 text-neutral-900'
      }`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5 text-left md:pr-4 font-sans">
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight font-sans ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Codex is an applied research team focused on building the future of software development.
              </h2>
              <p className={`text-sm leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>
                We believe that software engineering will be completely co-operative. Join a hyper-focused team of engineers scaling model capabilities, compilers, and UI tools.
              </p>
              <div>
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold group cursor-pointer border-b pb-0.5 transition-all ${
                  isDarkMode ? 'text-white hover:text-neutral-300 border-white' : 'text-neutral-900 hover:text-neutral-600 border-black'
                }`}>
                  <span>Join us</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* San phran team setup illustration mockup container widget */}
            <div className="h-[250px] bg-gradient-to-br from-neutral-800 via-stone-900 to-neutral-950 border border-neutral-800 rounded-2xl relative shadow-xl overflow-hidden flex items-center justify-center p-8 text-center text-white font-sans">
              <div className="absolute -inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800/35 via-stone-950 to-neutral-955 pointer-events-none"></div>
              <div className="space-y-2 relative z-10 max-w-xs font-sans">
                <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase font-mono">SAN FRANCISCO OFFICE</span>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-normal">Architecting next-generation autonomous coordinate editors</h3>
                <p className="text-[9.5px] text-neutral-400 font-semibold leading-relaxed">Creating compiler abstraction patterns that enable real-time cloud updates for complex multi-module systems.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent highlights blog posts section */}
      <section className={`border-y py-24 select-none w-full text-center transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950 border-neutral-850 text-neutral-100' 
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}>
        <div className="max-w-5xl mx-auto px-6 text-left">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-neutral-955'}`}>
            Recent highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-1 font-sans">
            <div 
              onClick={() => setActiveReportId(1)}
              className={`p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm cursor-pointer transition-all h-[170px] border ${
                isDarkMode 
                  ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700' 
                  : 'bg-[#fcfcf9] border-neutral-200/80 hover:border-neutral-400'
              }`}
            >
              <div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase block mb-1">Mar 27, 2026 • Research</span>
                <h3 className={`text-xs sm:text-sm font-extrabold leading-snug transition-colors ${isDarkMode ? 'text-neutral-105 hover:text-orange-450' : 'text-neutral-800 hover:text-orange-600'}`}>A technical report on Composer 2</h3>
              </div>
              <div className={`flex justify-between items-center text-[10px] text-neutral-400 font-bold mt-auto border-t pt-2 select-none font-sans font-semibold ${
                isDarkMode ? 'border-neutral-800/80' : 'border-neutral-100/50'
              }`}>
                <span>By Sasha Rush</span>
                <span>3 min read</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveReportId(2)}
              className={`p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm cursor-pointer transition-all h-[170px] border ${
                isDarkMode 
                  ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700' 
                  : 'bg-[#fcfcf9] border-neutral-200/80 hover:border-neutral-400'
              }`}
            >
              <div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase block mb-1 font-sans">May 18, 2026 • Research</span>
                <h3 className={`text-xs sm:text-sm font-extrabold leading-snug transition-colors ${isDarkMode ? 'text-neutral-105 hover:text-orange-450' : 'text-neutral-800 hover:text-orange-600'}`}>Introducing Composer 2.5</h3>
              </div>
              <div className={`flex justify-between items-center text-[10px] text-neutral-400 font-bold mt-auto border-t pt-2 select-none font-sans font-semibold ${
                isDarkMode ? 'border-neutral-800/80' : 'border-neutral-100/50'
              }`}>
                <span>By Codex Team</span>
                <span>7 min read</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveReportId(3)}
              className={`p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm cursor-pointer transition-all h-[170px] border ${
                isDarkMode 
                  ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700' 
                  : 'bg-[#fcfcf9] border-neutral-200/80 hover:border-neutral-400'
              }`}
            >
              <div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase block mb-1">Apr 2, 2026 • Product</span>
                <h3 className={`text-xs sm:text-sm font-extrabold leading-snug transition-colors ${isDarkMode ? 'text-neutral-105 hover:text-orange-450' : 'text-neutral-800 hover:text-orange-600'}`}>Meet the new Codex Sandbox Editor</h3>
              </div>
              <div className={`flex justify-between items-center text-[10px] text-neutral-400 font-bold mt-auto border-t pt-2 select-none font-sans font-semibold ${
                isDarkMode ? 'border-neutral-800/80' : 'border-neutral-100/50'
              }`}>
                <span>By Michael & Dualeh</span>
                <span>10 min read</span>
              </div>
            </div>
          </div>

          <div className="font-sans">
            <span 
              onClick={() => setActiveReportId(1)}
              className="inline-flex items-center gap-1 text-xs text-orange-655 hover:text-orange-855 font-bold cursor-pointer transition-all hover:translate-x-0.5"
            >
              <span>View all blog posts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards exactly modeled after Cursor.com plans */}
      <section className={`max-w-5xl mx-auto px-6 py-24 select-none text-center rounded-2xl transition-all ${
        isDarkMode 
          ? 'bg-neutral-900/10 border border-neutral-850 text-neutral-100' 
          : 'bg-[#fcfcf9] border-b border-neutral-150 text-neutral-900'
      }`}>
        
        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Sleek Pricing for any project scale.
        </h2>
        <p className={`text-xs sm:text-sm font-medium mb-12 max-w-lg mx-auto ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
          Start for free inside our sandboxed editor, and upgrade as your agent pipeline density expands.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
          
          {/* Plan 1: Hobbyist */}
          <div className={`p-6.5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-300 border transition-all font-sans ${
            isDarkMode 
              ? 'bg-neutral-950 border-neutral-850' 
              : 'bg-white border-neutral-200/80'
          }`}>
            <div className="space-y-4 font-sans">
              <div>
                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest block font-sans">Level 01</span>
                <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>Hobbyist</h3>
              </div>
              <div className="flex items-baseline gap-1 font-sans">
                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>$0</span>
                <span className="text-neutral-400 text-xs font-semibold">/ month</span>
              </div>
              <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-405' : 'text-neutral-500'}`}>
                Free basic sandbox with immediate access to autonomous templates and predictive autocomplete.
              </p>
              <hr className={isDarkMode ? 'border-neutral-850' : 'border-neutral-100'} />
              <ul className={`space-y-2 text-xs font-medium font-sans ${isDarkMode ? 'text-neutral-400' : 'text-neutral-605'}`}>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>50 short agent runs / month</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Full-stack editor panel access</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Local sandboxed render screens</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={onEnterIDE}
              className={`mt-6 w-full py-2 font-bold rounded-lg text-xs tracking-tight transition-all cursor-pointer text-center font-sans shadow-sm ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100' 
                  : 'bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800'
              }`}
            >
              Start Free
            </button>
          </div>

          {/* Plan 2: Pro */}
          <div className="bg-neutral-950 border-2 border-sky-400/80 p-6.5 rounded-2xl flex flex-col justify-between shadow-xl relative scale-102 transform font-sans">
            <div className="absolute -top-3 right-5 bg-sky-500 text-white font-black uppercase text-[8px] tracking-wide px-2.5 py-0.5 rounded-full shadow-md select-none">
              Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sky-400 text-[10px] font-black uppercase tracking-widest block font-sans">Level 02</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Pro Master</h3>
              </div>
              <div className="flex items-baseline gap-1 font-sans">
                <span className="text-3xl font-black text-white">$20</span>
                <span className="text-neutral-500 text-xs font-semibold">/ month</span>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                Maximize capability. Unlimited fast editor prompts and synchronized multi-agent pipelines.
              </p>
              <hr className="border-neutral-800" />
              <ul className="space-y-2 text-xs font-semibold text-neutral-300 font-sans">
                <li className="flex gap-2 items-center font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Unlimited fast agent prompts</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>10 custom project templates</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Co-Pilot automated pull checks</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Interactive file drag integration</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={onEnterIDE}
              className="mt-6 w-full py-2 bg-sky-450 hover:bg-sky-400 text-white font-bold rounded-lg text-xs tracking-tight transition-colors cursor-pointer text-center font-sans shadow-lg"
            >
              Get Codex Pro v2
            </button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className={`p-6.5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-neutral-305 border transition-all font-sans ${
            isDarkMode 
              ? 'bg-neutral-950 border-neutral-850' 
              : 'bg-white border-neutral-200/80'
          }`}>
            <div className="space-y-4">
              <div>
                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest block font-sans">Level 03</span>
                <h3 className={`text-xl font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>Enterprise</h3>
              </div>
              <div className="flex items-baseline gap-1 font-sans">
                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Custom</span>
              </div>
              <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                For complete technical organizations. Specialized isolated cloud VMs, OAuth credentials, and custom rule enforcement files.
              </p>
              <hr className={isDarkMode ? 'border-neutral-850' : 'border-neutral-100'} />
              <ul className={`space-y-2 text-xs font-medium font-sans ${isDarkMode ? 'text-neutral-450' : 'text-neutral-600'}`}>
                <li className="flex gap-2 items-center font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 font-sans" />
                  <span>Custom isolated cloud runners</span>
                </li>
                <li className="flex gap-2 items-center font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 font-sans" />
                  <span>Custom OAuth integration models</span>
                </li>
                <li className="flex gap-2 items-center font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 font-sans" />
                  <span>Dedicated developer support logs</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={onEnterIDE}
              className={`mt-6 w-full py-2 font-bold rounded-lg text-xs tracking-tight transition-colors cursor-pointer text-center shadow-sm font-sans ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100' 
                  : 'bg-neutral-150 hover:bg-neutral-200 text-neutral-900'
              }`}
            >
              Contact Organizations
            </button>
          </div>

        </div>

      </section>

      {/* Large majestic CTA download panel */}
      <section className={`py-24 select-none max-w-5xl mx-auto w-full text-center flex flex-col items-center justify-center space-y-6 transition-colors ${
        isDarkMode ? 'bg-neutral-900/10 text-neutral-100' : 'bg-[#f9f9f6] text-neutral-900'
      }`}>
        <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-none font-sans ${isDarkMode ? 'text-white' : 'text-neutral-955'}`}>
          Try Codex now.
        </h2>
        
        <div className="pt-2 font-sans">
          <button 
            onClick={onEnterIDE}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-103 text-center ${
              isDarkMode 
                ? 'bg-white hover:bg-neutral-100 text-neutral-955 font-black' 
                : 'bg-neutral-950 hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Download for Windows & macOS</span>
            <ArrowRight className="w-4 h-4 text-sky-450" />
          </button>
        </div>
      </section>

      {/* Rich Deep Footer with 5 columns exactly matching Cursor format */}
      <footer className={`border-t py-16 px-6 sm:px-12 text-xs select-none font-sans w-full transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950 border-neutral-900 text-[rgba(255,255,255,0.45)]' 
          : 'bg-[#fcfcf9] border-neutral-200/80 text-neutral-500'
      }`}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-left mb-16">
          <div className="space-y-3.5 font-sans">
            <h4 className="font-extrabold text-neutral-850 tracking-tight select-none text-[11px] uppercase font-sans">Product</h4>
            <ul className="space-y-2.5 font-semibold text-neutral-500 text-xs font-sans">
              <li className="hover:text-neutral-955 cursor-pointer transition-colors" onClick={onEnterIDE}>Agents</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Teams</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Enterprise</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Code Review</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Tab Model</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">CLI Engine</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Cloud Workers</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans">Marketplace</li>
            </ul>
          </div>

          <div className="space-y-3.5 font-sans">
            <h4 className="font-extrabold text-neutral-850 tracking-tight select-none text-[11px] uppercase">Resources</h4>
            <ul className="space-y-2.5 font-semibold text-neutral-500 text-xs font-sans">
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans">Download</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Changelog</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans">Docs Portal</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Learn Engine</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Forum Community</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans font-sans font-sans">Help Center</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Workshops</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Status Logs</li>
            </ul>
          </div>

          <div className="space-y-3.5 font-sans">
            <h4 className="font-extrabold text-neutral-850 tracking-tight select-none text-[11px] uppercase font-sans">Company</h4>
            <ul className="space-y-2.5 font-semibold text-neutral-500 text-xs font-sans">
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Community</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans">Students</li>
              <li className="hover:text-neutral-950 cursor-pointer transition-colors">Brand Book</li>
              <li className="hover:text-neutral-950 cursor-pointer transition-colors">Future Plans</li>
              <li className="hover:text-neutral-950 cursor-pointer transition-colors font-sans">Anysphere</li>
            </ul>
          </div>

          <div className="space-y-3.5 font-sans mb-1">
            <h4 className="font-extrabold text-neutral-850 tracking-tight select-none text-[11px] uppercase font-sans">Legal</h4>
            <ul className="space-y-2.5 font-semibold text-neutral-500 text-xs">
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors font-sans">Data Use</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">Security Rules</li>
            </ul>
          </div>

          <div className="space-y-3.5 font-sans">
            <h4 className="font-extrabold text-neutral-850 tracking-tight select-none text-[11px] uppercase">Connect</h4>
            <ul className="space-y-2.5 font-semibold text-neutral-500 text-xs font-sans">
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">X / Twitter</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">LinkedIn</li>
              <li className="hover:text-neutral-955 cursor-pointer transition-colors">YouTube Channel</li>
            </ul>
          </div>
        </div>

        <div className={`max-w-6xl mx-auto pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-neutral-400 font-sans mt-3 ${
          isDarkMode ? 'border-neutral-850' : 'border-neutral-200/60'
        }`}>
          <div className="flex items-center gap-2 text-[11px]">
            <span>© 2026 Anysphere, Inc.</span>
            <span className={isDarkMode ? 'text-neutral-800' : 'text-neutral-300'}>|</span>
            <span className="flex items-center gap-1.5 text-neutral-500">
              <span className="text-emerald-500 font-bold font-sans">✔</span> SOC 2 Certified
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-sans">
            <div className={`flex items-center rounded-md p-1 px-2.5 gap-1.5 select-none font-sans font-extrabold ${
              isDarkMode 
                ? 'bg-neutral-900 border border-neutral-800 text-neutral-300' 
                : 'bg-neutral-100 border border-neutral-200/80 text-neutral-600'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive technical report / blog reader overlay modal */}
      {activeReportId !== null && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-fade-in border ${
            isDarkMode 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100' 
              : 'bg-white border-neutral-200/80 text-neutral-900'
          }`}>
            {/* Header */}
            <div className={`flex justify-between items-center px-6 py-4 border-b ${
              isDarkMode 
                ? 'border-neutral-800 bg-neutral-950/40 text-neutral-400' 
                : 'border-neutral-100 bg-neutral-50/50 text-neutral-400'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider font-sans">
                Technical Highlights
              </span>
              <button 
                onClick={() => setActiveReportId(null)}
                className={`p-1 px-2.5 rounded-lg border transition-all cursor-pointer font-sans text-xs flex items-center gap-1 font-bold shadow-sm ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-neutral-205 border-neutral-700 hover:bg-neutral-700 hover:text-white' 
                    : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 space-y-6 overflow-y-auto text-left font-sans">
              {activeReportId === 1 && (
                <div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-orange-655 font-black uppercase tracking-wider bg-orange-50 border border-orange-200/30 px-3 py-1 rounded-full font-sans">
                      Research Paper
                    </span>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight pt-2 font-sans ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      A technical report on Composer 2
                    </h1>
                    <p className={`text-sm font-semibold leading-relaxed pt-1 font-sans ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Benchmarking the next-generation multi-file code editing, parallel thread structures, and regression testing orchestration.
                    </p>
                  </div>

                  <div className={`flex items-center gap-3 border-b py-5 mt-3 text-xs text-neutral-400 font-bold font-sans ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold font-sans">SR</div>
                    <div>
                      <div className={isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}>By Sasha Rush</div>
                      <div className="text-[10px] font-medium text-neutral-400 block mt-0.5">Published March 27, 2026 • 3 min read</div>
                    </div>
                  </div>

                  <div className={`mt-6 space-y-4 text-xs sm:text-sm font-semibold leading-relaxed font-sans ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    <p>
                      Over the past twelve months, writing code with large language models has advanced from trivial single-file autocompletes to active multi-file code refactoring chains. Traditional systems fall short in scale, requesting full rewrites that exceed latency tolerations. Today, we present a detailed evaluation of <strong>Composer 2</strong>: our parallel multi-core thread coordinator.
                    </p>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>The Core Architecture: Thread Isolation</h3>
                    <p>
                      Instead of feeding raw full-file chunks to standard model context structures, Composer 2 splits file updates into clean, isolated diff operations. Our engine generates dedicated sub-process workers to compile, check syntax lint, and test those files concurrently.
                    </p>

                    <div className={`font-mono text-[10.5px] rounded-xl border p-4 leading-normal select-none my-4 ${isDarkMode ? 'bg-neutral-950 border-neutral-850 text-neutral-300' : 'bg-neutral-900 border-neutral-800 text-neutral-200'}`}>
                      <div className="flex justify-between items-center text-[8.5px] text-neutral-500 border-b border-neutral-900 pb-2 mb-2 font-black uppercase tracking-wider">
                        <span>Composer 2 Matrix Allocation</span>
                        <span className="text-orange-400">Isolated Diff Pools</span>
                      </div>
                      <div className="space-y-1 text-sky-450 font-mono">
                        <div>$ npm run compile-patch-chunks</div>
                        <div className="text-emerald-400 font-mono">⮑ [Worker #01] Patched 'app.js' in 150ms.</div>
                        <div className="text-emerald-400 font-mono">⮑ [Worker #02] Verified syntax boundaries for 'routes.ts'.</div>
                        <div className="text-amber-500 font-bold font-mono">↳ Regression state validation: 0 warnings found.</div>
                      </div>
                    </div>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>Latency and Success Benchmarks</h3>
                    <p>
                      Under intensive 1-million-line workloads, Composer 2 outperforms standard orchestrators by avoiding context window dilution:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans">
                      <li><strong>Multi-file compilation accuracy</strong>: Reaches 94.3% (compared to 71.2% in our legacy builds).</li>
                      <li><strong>Context preservation precision</strong>: Safely maintains an average accuracy rate of 99.1%.</li>
                      <li><strong>Patch Latency</strong>: Processes 10 separate file changes in parallel in under 2.4 seconds.</li>
                    </ul>

                    <p className="pt-2">
                      Through localized, thread-isolated patch allocations, Composer 2 sets a reliable, production-ready standard for co-cooperative AI engineering.
                    </p>
                  </div>
                </div>
              )}

              {activeReportId === 2 && (
                <div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-sky-600 font-black uppercase tracking-wider bg-sky-50 border border-sky-200/30 px-3 py-1 rounded-full font-sans">
                      Product Release
                    </span>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight pt-2 font-sans ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Introducing Composer 2.5
                    </h1>
                    <p className={`text-sm font-semibold leading-relaxed pt-1 font-sans ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Elevating multi-file code refinement with real-time visual canvases, /loop auto-checks, and self-healing compilers.
                    </p>
                  </div>

                  <div className={`flex items-center gap-3 border-b py-5 mt-3 text-xs text-neutral-400 font-bold font-sans ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-extrabold font-sans">CT</div>
                    <div>
                      <div className={isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}>By Codex Team</div>
                      <div className="text-[10px] font-medium text-neutral-400 block mt-0.5">Published May 18, 2026 • 7 min read</div>
                    </div>
                  </div>

                  <div className={`mt-6 space-y-4 text-xs sm:text-sm font-semibold leading-relaxed font-sans ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    <p>
                      Today, we are thrilled to unveil <strong>Composer 2.5</strong>, a monumental shift in how engineers and autonomous agents build together. We are launching several high-impact features including visual loop testing, native canvas rendering, and zero-latency self-healing compiler pipelines.
                    </p>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>Visual Feedback Loop Model</h3>
                    <p>
                      With our new sandbox structures, you can view the live viewport of your application in real-time. In version 2.5, the model can also <em>see</em> the output! If a layout alignment is off, or text has insufficient color contrast, the agent captures a vector snapshot through the sandbox visual rendering bridge, then adjusts Tailwind classes to fit.
                    </p>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>Autonomous Command Terminal</h3>
                    <p>
                      Underneath the workspace, the agent reads and writes directly to an active build layer using the <code>/loop</code> command chain:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans">
                      <li><strong>Linter Healing</strong>: TSC and ESLint logs are piped back to the parser, instantly fixing layout and type typos.</li>
                      <li><strong>Self-Correction</strong>: If a web dependencies import is missing, our background scheduler downloads the correct package in under 400ms.</li>
                    </ul>

                    <p className="pt-2">
                      Composer 2.5 is now fully active inside our Sandbox editor interface. Click “Enter Sandbox Workspace” below to explore these capabilities immediately.
                    </p>
                  </div>
                </div>
              )}

              {activeReportId === 3 && (
                <div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-fuchsia-600 font-black uppercase tracking-wider bg-fuchsia-50 border border-fuchsia-200/30 px-3 py-1 rounded-full font-sans">
                      Sandbox Infrastructure
                    </span>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight pt-2 font-sans ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Meet the new Codex Sandbox Editor
                    </h1>
                    <p className={`text-sm font-semibold leading-relaxed pt-1 font-sans ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      A robust, high-performance cloud container infrastructure that spins up fully responsive full-stack environments in 300 milliseconds.
                    </p>
                  </div>

                  <div className={`flex items-center gap-3 border-b py-5 mt-3 text-xs text-neutral-400 font-bold font-sans ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-400 to-pink-600 flex items-center justify-center text-white font-extrabold font-sans">MD</div>
                    <div>
                      <div className={isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}>By Michael & Dualeh</div>
                      <div className="text-[10px] font-medium text-neutral-400 block mt-0.5">Published April 2, 2026 • 10 min read</div>
                    </div>
                  </div>

                  <div className={`mt-6 space-y-4 text-xs sm:text-sm font-semibold leading-relaxed font-sans ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    <p>
                      Setting up local environments remains one of the largest friction points for software development. Node version mismatches, forgotten packages, and heavy memory layouts can halt any creative coding session. The <strong>Codex Sandbox Editor</strong> resolves this by moving the compiler directly into our high-speed Cloud Run containers.
                    </p>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>How the Sandbox Operates</h3>
                    <p>
                      When you launch a pre-configured template, our control plane provisions a stateless full-stack workspace container within 300 milliseconds:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans">
                      <li><strong>Reverse Proxy Gateway</strong>: High-speed proxy routers point traffic exclusively to your designated sandboxed port, permitting secure, real-time preview streams.</li>
                      <li><strong>Instant Hydration</strong>: Local React state and workspace files are synchronized through WebSockets, resulting in a perfect representation of your local edits inside the preview viewport.</li>
                    </ul>

                    <h3 className={`text-[15px] font-black pt-2 font-sans tracking-tight ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>Security Sandbox</h3>
                    <p>
                      Every developer container operates inside a isolated, secure runtime. File revisions, API accesses, and testing schedules execute cleanly with no risk of leakage, meeting strict SOC 2 enterprise compliance rules.
                    </p>

                    <p className="pt-2">
                      Test driving full-stack features has never been this instant. Press the "Enter Sandbox Workspace" button on the upper navigation bar to begin compiling!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className={`p-6 border-t flex justify-end gap-3 font-sans ${isDarkMode ? 'border-neutral-800 bg-neutral-950/45' : 'border-neutral-100 bg-neutral-50/50'}`}>
              <button
                onClick={() => setActiveReportId(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isDarkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  setActiveReportId(null);
                  onEnterIDE();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-white text-neutral-950 hover:bg-neutral-100' 
                    : 'bg-neutral-950 text-white hover:bg-neutral-850'
                }`}
              >
                Enter Sandbox Workspace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
