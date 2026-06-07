/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  Terminal,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CodeFile } from '../types';
import { translations } from '../translations';

interface LivePreviewProps {
  files: CodeFile[];
  activeTemplateName: string;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

const getLivePreviewText = (key: 'fullSize' | 'activeShell' | 'consoleBridge' | 'clear' | 'noLogs', lang: string) => {
  const dictionary: Record<string, Record<string, string>> = {
    en: {
      fullSize: 'Full Size',
      activeShell: 'Active Shell',
      consoleBridge: 'Developer Console Bridge',
      clear: 'Clear',
      noLogs: 'No output logs captured. Interact with sandbox to emit logs.',
    },
    zh: {
      fullSize: '全屏',
      activeShell: '活动外壳',
      consoleBridge: '开发者控制台桥接',
      clear: '清空',
      noLogs: '未捕获到输出日志。与沙盒交互可产生日志。',
    },
    ja: {
      fullSize: '全画面',
      activeShell: 'アクティブシェル',
      consoleBridge: '開発者コンソールブリッジ',
      clear: 'クリア',
      noLogs: '出力ログはキャプチャされていません。ログを出力するには、サボボックスを操作してください。',
    },
    zht: {
      fullSize: '全屏',
      activeShell: '活動外殼',
      consoleBridge: '開發者主控台橋接',
      clear: '清除',
      noLogs: '未捕獲到輸出日誌。與沙盒互動可產生日誌。',
    },
    es: {
      fullSize: 'Tamaño Completo',
      activeShell: 'Entorno Activo',
      consoleBridge: 'Puente de Consola de Desarrollador',
      clear: 'Limpiar',
      noLogs: 'No se han capturado registros de salida. Interactúa con el entorno para emitir registros.',
    },
    fr: {
      fullSize: 'Plein Écran',
      activeShell: 'Environnement Actif',
      consoleBridge: 'Pont de Console Développeur',
      clear: 'Effacer',
      noLogs: 'Aucun journal de sortie capturé. Interagissez avec le bac à sable pour émettre des journaux.',
    },
    pt: {
      fullSize: 'Tamanho Completo',
      activeShell: 'Ambiente Ativo',
      consoleBridge: 'Ponte de Console do Desenvolvedor',
      clear: 'Limpar',
      noLogs: 'Nenhum registro de saída capturado. Interaja com o sandbox para emitir registros.',
    },
    ko: {
      fullSize: '전체 화면',
      activeShell: '활성 셸',
      consoleBridge: '개발자 콘솔 브릿지',
      clear: '지우기',
      noLogs: '캡처된 출력 로그가 없습니다. 로그를 출력하려면 샌드박스와 상호작용하십시오.',
    },
    de: {
      fullSize: 'Vollbild',
      activeShell: 'Aktive Shell',
      consoleBridge: 'Entwicklerkonsolen-Brücke',
      clear: 'Löschen',
      noLogs: 'Keine Ausgabeprotokolle erfasst. Interagieren Sie mit der Sandbox, um Protokolle auszugeben.',
    },
    hi: {
      fullSize: 'पूर्ण आकार',
      activeShell: 'सक्रिय शेल',
      consoleBridge: 'डेवलपर कंसोल ब्रिज',
      clear: 'साफ़ करें',
      noLogs: 'कोई आउटपुट लॉग कैप्चर नहीं किया गया। लॉग उत्सर्जित करने के लिए सैंडबॉक्स के साथ बातचीत करें।',
    }
  };
  return (dictionary[lang] || dictionary['en'])[key];
};

export default function LivePreview({ files, activeTemplateName, currentLang }: LivePreviewProps) {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<{ text: string; time: string; type: 'log' | 'info' | 'error' }[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Collapsed by default to maximize preview area
  const [isEdgeToEdge, setIsEdgeToEdge] = useState(true); // Full size edge-to-edge rendering block by default for clean layout fit

  // Re-generate srcDoc on sandbox modification
  useEffect(() => {
    const htmlFile = files.find(f => f.name === 'index.html');
    const jsFile = files.find(f => f.name.endsWith('.js') || f.name.endsWith('.ts'));
    const cssFile = files.find(f => f.name.endsWith('.css'));

    if (!htmlFile) {
      setIframeSrcDoc('<html><body style="color:#9ca3af;font-family:sans-serif;padding:2rem;text-align:center;"><h3>No index.html file found in active workspace index templates.</h3></body></html>');
      return;
    }

    let rawCode = htmlFile.content;

    // Inject console logging bridge proxy
    const proxyScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          console.log = function(...args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              logType: 'log',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }, '*');
            originalLog.apply(console, args);
          };

          console.error = function(...args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              logType: 'error',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }, '*');
            originalError.apply(console, args);
          };

          console.warn = function(...args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              logType: 'info',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }, '*');
            originalWarn.apply(console, args);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              logType: 'error',
              message: message + ' (line ' + lineno + ')'
            }, '*');
          };
        })();
      </script>
    `;

    // Inject proxy script right after head tag
    rawCode = rawCode.replace('<head>', `<head>\n${proxyScript}`);

    // If script reference exists in html (<script src="/app.js"></script> etc) replace with raw contents
    if (jsFile) {
      const jsSrcRegex = /<script\s+src=["']\/?(app\.js|\.\/app\.js|main\.js)["']\s*><\/script>/g;
      if (rawCode.match(jsSrcRegex)) {
        rawCode = rawCode.replace(jsSrcRegex, `<script>\n${jsFile.content}\n</script>`);
      } else {
        // Fallback: inject raw script at body end
        rawCode = rawCode.replace('</body>', `<script>\n${jsFile.content}\n</script>\n</body>`);
      }
    }

    // Replace reference CSS with real content
    if (cssFile) {
      const cssSrcRegex = /<link\s+rel=["']stylesheet["']\s+href=["']\/?(index\.css|style\.css|app\.css)["']\s*\/?>/g;
      if (rawCode.match(cssSrcRegex)) {
        rawCode = rawCode.replace(cssSrcRegex, `<style>\n${cssFile.content}\n</style>`);
      } else {
        rawCode = rawCode.replace('</head>', `<style>\n${cssFile.content}\n</style>\n</head>`);
      }
    }

    setIframeSrcDoc(rawCode);
  }, [files]);

  // Listener to capture emulated sandbox logs
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SANDBOX_CONSOLE') {
        setConsoleLogs(prev => [
          ...prev, 
          { 
            text: e.data.message, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: e.data.logType 
          }
        ].slice(-60)); // limit 60 logs
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    setIframeKey(k => k + 1);
  };

  const iframeElement = useMemo(() => {
    return (
      <iframe
        key={iframeKey}
        srcDoc={iframeSrcDoc}
        title="Codex Core Render Canvas"
        sandbox="allow-scripts allow-modals"
        className="w-full h-full border-0 bg-neutral-950"
      />
    );
  }, [iframeSrcDoc, iframeKey]);

  // Determine viewport width & classes for realistic device visualization
  const getViewportSizeClasses = () => {
    if (isEdgeToEdge) {
      return 'w-full h-full border-0 rounded-none shadow-none flex flex-col bg-neutral-950 transition-all duration-300';
    }
    switch (viewportMode) {
      case 'mobile':
        return 'w-[375px] h-[812px] max-w-full rounded-[36px] border-[10px] border-neutral-900 shadow-2xl relative flex flex-col bg-neutral-950 transition-all duration-300 flex-shrink-0';
      case 'tablet':
        return 'w-[768px] h-[1024px] max-w-full rounded-[24px] border-[12px] border-neutral-900 shadow-2xl relative flex flex-col bg-neutral-950 transition-all duration-300 flex-shrink-0';
      default:
        return 'w-full h-full max-w-full rounded-2xl border border-neutral-800 bg-neutral-950 shadow-inner flex flex-col transition-all duration-300';
    }
  };

  return (
    <div id="live-preview-container" className="flex flex-col h-full bg-neutral-950 text-neutral-300 flex-1 relative overflow-hidden">
      
      {/* Simulation browser header control bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/95 font-sans z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5 animate-pulse">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          </span>
          <span className="hidden sm:inline-block text-xs text-neutral-400 font-bold ml-2">Live Application Preview</span>
          {isEdgeToEdge && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold tracking-wide animate-pulse">
              EDGE-TO-EDGE
            </span>
          )}
        </div>

        {/* Viewport resizing toggles */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1 gap-0.5">
          <button
            onClick={() => {
              setViewportMode('desktop');
              setIsEdgeToEdge(false);
            }}
            className={`p-1.5 rounded-md transition-all ${
              viewportMode === 'desktop' && !isEdgeToEdge 
                ? 'bg-sky-500/10 border border-transparent text-sky-400 font-semibold shadow-inner' 
                : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
            }`}
            title="Desktop Resolution Mode"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => {
              setViewportMode('tablet');
              setIsEdgeToEdge(false);
            }}
            className={`p-1.5 rounded-md transition-all ${
              viewportMode === 'tablet' && !isEdgeToEdge 
                ? 'bg-sky-500/10 border border-transparent text-sky-400 font-semibold shadow-inner' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Tablet Resolution Mode"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setViewportMode('mobile');
              setIsEdgeToEdge(false);
            }}
            className={`p-1.5 rounded-md transition-all ${
              viewportMode === 'mobile' && !isEdgeToEdge 
                ? 'bg-sky-500/10 border border-transparent text-sky-400 font-semibold shadow-inner' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Mobile Resolution Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <span className="w-[1px] h-4 bg-neutral-850 mx-1"></span>

          <button
            onClick={() => setIsEdgeToEdge(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
              isEdgeToEdge 
                ? 'bg-sky-500/15 border border-sky-500/20 text-sky-300 shadow-md' 
                : 'bg-neutral-950/45 hover:bg-neutral-800 text-neutral-400 border border-neutral-800/85 hover:border-neutral-700'
            }`}
            title="Toggle Edge-to-Edge Canvas (Saves maximum device screen space)"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden md:inline">{getLivePreviewText('fullSize', currentLang)}</span>
          </button>
        </div>

        {/* Refresh & other actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-sky-400 rounded-md transition-colors border border-transparent hover:border-neutral-800"
            title="Reload Sandbox Frame"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Emulator container view */}
      <div 
        className="flex-1 bg-neutral-900 overflow-auto flex relative transition-all duration-300"
      >
        {!isEdgeToEdge && (
          <div className="absolute top-3 left-4 text-[9px] bg-neutral-950/60 backdrop-blur text-sky-450/85 md:text-sky-400/80 px-2 py-0.5 border border-neutral-800/80 rounded-md pointer-events-none font-semibold uppercase tracking-wider z-20 hidden sm:block select-none">
            {getLivePreviewText('activeShell', currentLang)}: {activeTemplateName} ({viewportMode})
          </div>
        )}

        <div className={`m-auto flex-shrink-0 ${isEdgeToEdge ? '' : 'p-4 sm:p-6 md:p-8'}`}>
          {/* Virtual Device Wrapping Chassis - styled specifically like real devices */}
          <div className={`${getViewportSizeClasses()} transition-all duration-300`}>
            
            {/* Smartphone camera punch layout marker if in mobile mode */}
            {viewportMode === 'mobile' && !isEdgeToEdge && (
              <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                <span className="w-7 h-1 bg-neutral-800 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-neutral-950 rounded-full border border-neutral-800"></span>
              </div>
            )}

            {/* Browser Address Bar: hidden in Edge-to-Edge mode to allow maximum area */}
            {!isEdgeToEdge && (
              <div className="bg-neutral-900 border-b border-neutral-800/80 px-4 py-2 flex items-center z-10 select-none flex-shrink-0">
                <div className="flex-1 bg-neutral-950 text-neutral-400 rounded-md border border-neutral-800 px-3 py-1 text-[10px] truncate max-w-lg select-all font-mono">
                  https://codex.sandbox/sandbox_env/index.html
                </div>
              </div>
            )}
            
            {/* Actual Iframe Rendering Client Space - ALWAYS occupies 100% full height of device */}
            <div className="flex-1 bg-neutral-950 relative overflow-hidden select-text">
              {iframeElement}
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Console Log Terminal Block */}
      <div className={`flex flex-col border-t border-neutral-800 bg-neutral-950 transition-all ${isConsoleOpen ? 'h-44' : 'h-10'} flex-shrink-0`}>
        <div 
          onClick={() => setIsConsoleOpen(prev => !prev)}
          className="flex items-center justify-between px-4 py-2 bg-neutral-900/40 border-b border-neutral-800 cursor-pointer hover:bg-neutral-900/70 select-none"
        >
          <span className="flex items-center gap-2 text-neutral-400 font-mono text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold tracking-wider">{getLivePreviewText('consoleBridge', currentLang)}</span>
            {consoleLogs.length > 0 && (
              <span className="bg-sky-400/15 text-sky-450 text-sky-400 border border-sky-400/20 px-1.5 py-0.2 text-[8px] rounded-full font-sans font-bold">
                {consoleLogs.length} LOGS
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConsoleLogs([]);
              }}
              className="text-[9px] hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-950 px-2 py-0.5 rounded transition-colors"
            >
              {getLivePreviewText('clear', currentLang)}
            </button>
            <button className="text-neutral-500 hover:text-neutral-300">
              {isConsoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        
        {/* Terminal display items - hidden if collapsed */}
        {isConsoleOpen && (
          <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-left font-mono text-[10px] select-all scrollbar-thin">
            {consoleLogs.length === 0 ? (
              <span className="text-neutral-500 italic block py-2">{getLivePreviewText('noLogs', currentLang)}</span>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 leading-relaxed border-b border-neutral-900/40 pb-1 last:border-0">
                  <span className="text-neutral-600 font-medium whitespace-nowrap">[{log.time}]</span>
                  <span className={`text-stone-300 ${
                    log.type === 'error' ? 'text-red-400 font-semibold' : 
                    log.type === 'info' ? 'text-amber-400' : 
                    'text-stone-350'
                  }`}>
                    {log.type === 'error' ? '❌' : log.type === 'info' ? '⚠️' : '›'} {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
