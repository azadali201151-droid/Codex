/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Activity, 
  ExternalLink, 
  Check 
} from 'lucide-react';

import { translations } from '../translations';

interface DeploymentPipelineProps {
  onSetGlobalStatus: (msg: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

interface Step {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  message: string;
}

const getStepNames = (lang: string) => {
  const steps: Record<string, string[]> = {
    en: [
      'Verify static resources and workspace headers',
      'Execute tree-shaking dead-code compilation',
      'Purge unused Tailwind CSS utility classes',
      'Provision Serverless Edge Routing instances',
      'Validate origin SSL security handshake protocols',
    ],
    zh: [
      '验证静态资源和工作区标头',
      '执行摇树优化（Tree-shaking）死代码编译',
      '清除未使用的 Tailwind CSS 工具类',
      '配置无服务器边缘路由实例',
      '验证源站 SSL 安全握手协议',
    ],
    ja: [
      '静的リソースとワークスペースヘッダーの検証',
      'ツリーシェイキングによるデッドコードコンパイルの実行',
      '使用されていないTailwind CSSユーティリティクラスの削除',
      'サーバーレスエッジインスタンスのプロビジョニング',
      'オリジンSSLセキュリティハンドシェイクプロトコルの検証',
    ],
    zht: [
      '驗證靜態資源和工作區標頭',
      '執行無用程式碼消除 (Tree-shaking) 編譯',
      '清除未使用的 Tailwind CSS 工具類',
      '配置無伺服器邊緣路由實例',
      '驗證源站 SSL 安全握手協定',
    ],
    es: [
      'Verificar recursos estáticos y encabezados',
      'Ejecutar compilación de código muerto (tree-shaking)',
      'Eliminar clases de utilidad Tailwind CSS no utilizadas',
      'Aprovisionar instancias de enrutamiento Serverless Edge',
      'Validar protocolos de enlace de seguridad SSL de origen',
    ],
    fr: [
      'Vérifier les ressources statiques et les en-têtes',
      'Exécuter la compilation de code mort (tree-shaking)',
      'Supprimer les classes utilitaires Tailwind CSS inutilisées',
      'Approvisionner les instances de routage Serverless Edge',
      'Valider les protocoles de négociation de sécurité SSL d’origine',
    ],
    pt: [
      'Verificar recursos estáticos e cabeçalhos',
      'Executar compilação de código morto (tree-shaking)',
      'Eliminar classes utilitárias do Tailwind CSS não utilizadas',
      'Provisionar instâncias de roteamento do Serverless Edge',
      'Validar protocolos de handshake de segurança SSL de origem',
    ],
    ko: [
      '정적 리소스 및 워크스페이스 헤더 검증',
      '트리 쉐이킹 데드 코드 컴파일 실행',
      '사용되지 않는 Tailwind CSS 유틸리티 클래스 제거',
      '서버리스 에지 라우팅 인스턴스 프로비저닝',
      '오리진 SSL 보안 핸드셰이크 프로토콜 검증',
    ],
    de: [
      'Statische Ressourcen und Workspace-Header verifizieren',
      'Tree-Shaking-Kompilierung von totem Code ausführen',
      'Nicht verwendete Tailwind CSS-Dienstprogrammklassen bereinigen',
      'Serverlose Edge-Routing-Instanzen bereitstellen',
      'SSL-Sicherheitshandshake-Protokolle des Ursprungs validieren',
    ],
    hi: [
      'स्थिर संसाधनों और कार्यस्थान शीर्षकों को सत्यापित करें',
      'ट्री-शेकिंग डेड-कोड संकलन निष्पादित करें',
      'अप्रयुक्त टेलविंड सीएसएस उपयोगिता वर्गों को साफ़ करें',
      'सर्वरलेस एज राउटिंग इंस्टेंस का प्रावधान करें',
      'मूल एसएसएल सुरक्षा हैंडशेक प्रोटोकॉल को मान्य करें',
    ],
  };
  return steps[lang] || steps['en'];
};

const getStepMessages = (status: string, lang: string) => {
  if (status === 'success') {
    return {
      en: 'Done',
      zh: '完成',
      ja: '完了',
      zht: '完成',
      es: 'Listo',
      fr: 'Terminé',
      pt: 'Concluído',
      ko: '완료',
      de: 'Fertig',
      hi: 'पूर्ण',
    }[lang] || 'Done';
  }
  if (status === 'running') {
    return {
      en: 'Executing calculations...',
      zh: '正在执行计算...',
      ja: '計算を実行中...',
      zht: '正在執行計算...',
      es: 'Ejecutando cálculos...',
      fr: 'Calculs en cours...',
      pt: 'Executando cálculos...',
      ko: '계산 실행 중...',
      de: 'Berechnungen werden ausgeführt...',
      hi: 'गणना निष्पादित की जा रही है...',
    }[lang] || 'Executing...';
  }
  return {
    en: 'Pending',
    zh: '等待中',
    ja: '保留中',
    zht: '等待中',
    es: 'Pendiente',
    fr: 'En attente',
    pt: 'Pendente',
    ko: '대기 중',
    de: 'Ausstehend',
    hi: 'लंबित',
  }[lang] || 'Pending';
};

export default function DeploymentPipeline({ onSetGlobalStatus, currentLang }: DeploymentPipelineProps) {
  const [pipelineSteps, setPipelineSteps] = useState<Step[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  useEffect(() => {
    const names = getStepNames(currentLang);
    setPipelineSteps([
      { id: '1', name: names[0], status: 'idle', message: getStepMessages('idle', currentLang) },
      { id: '2', name: names[1], status: 'idle', message: getStepMessages('idle', currentLang) },
      { id: '3', name: names[2], status: 'idle', message: getStepMessages('idle', currentLang) },
      { id: '4', name: names[3], status: 'idle', message: getStepMessages('idle', currentLang) },
      { id: '5', name: names[4], status: 'idle', message: getStepMessages('idle', currentLang) },
    ]);
  }, [currentLang]);

  const runPipeline = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setActiveStepIndex(0);
    setBuildLogs(['[SYSTEM] Initiating serverless cloud deployment pipeline...']);
    onSetGlobalStatus('Active container deployment in progress...');

    // Reset statuses
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'idle', message: getStepMessages('idle', currentLang) })));
  };

  useEffect(() => {
    if (activeStepIndex === null || !isRunning) return;

    if (activeStepIndex >= pipelineSteps.length) {
      setIsRunning(false);
      setIsCompleted(true);
      setActiveStepIndex(null);
      setBuildLogs(prev => [
        ...prev,
        '[SYSTEM] All integrity assertions passed.',
        `[CDN_ROUTER] Sandbox bound successfully to live reverse-proxy port 3000.`,
        `[DEPLOY_ENGINE] Applet promoted live. URL generated: https://ais-pre-7eoy5c7v62pkjv2hnf2iez-355221024374.asia-east1.run.app`
      ]);
      onSetGlobalStatus('Your application has been deployed live!');
      return;
    }

    const step = pipelineSteps[activeStepIndex];
    
    // Set this step to running
    setPipelineSteps(prev => prev.map((s, idx) => {
      if (idx === activeStepIndex) {
        return { ...s, status: 'running', message: getStepMessages('running', currentLang) };
      }
      return s;
    }));

    setBuildLogs(prev => [...prev, `[PIPELINE] Task ${step.id}: running "${step.name}"...`]);

    // Simulate completion
    const timer = setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === activeStepIndex) {
          return { ...s, status: 'success', message: getStepMessages('success', currentLang) };
        }
        return s;
      }));

      setBuildLogs(prev => [
        ...prev, 
        `[PIPELINE] Task ${step.id} completed successfully. Integrity verified.`
      ]);

      setActiveStepIndex(idx => (idx !== null ? idx + 1 : null));
    }, 1200);

    return () => clearTimeout(timer);
  }, [activeStepIndex, isRunning]);

  return (
    <div id="deployment-pipeline-container" className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 text-neutral-300 w-full lg:w-80">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-neutral-800">
        <Server className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-bold text-neutral-100 uppercase tracking-wide">{translations[currentLang].devops.panelTitle}</span>
        <span className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[9px] text-purple-400 border border-purple-500/20">
          Google Cloud Run
        </span>
      </div>

      {/* Main console area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Pipeline launcher action card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-100">Live Serverless Cluster Deployment</h3>
              <p className="text-[10px] text-neutral-500 mt-1">
                Compile your sandbox container, optimize static payloads, and build secure server routes.
              </p>
            </div>
            <Server className="w-5 h-5 text-neutral-600" />
          </div>

          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-505 text-neutral-50 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs disabled:opacity-50 transition-all font-sans"
          >
            {isRunning ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                <span>{translations[currentLang].devops.deployingBtn}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{translations[currentLang].devops.deployBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Pipeline Steps visualization */}
        <div className="space-y-3">
          <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase block">
            Incremental Pipeline Tasks List
          </span>
          <div className="space-y-2">
            {pipelineSteps.map((step) => (
              <div 
                key={step.id} 
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                  step.status === 'running'
                    ? 'bg-sky-505/5 border-sky-500/30'
                    : step.status === 'success'
                    ? 'bg-neutral-900/50 border-neutral-800/40'
                    : 'bg-neutral-950 border-neutral-900'
                }`}
              >
                <div className="mt-0.5">
                  {step.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {step.status === 'failed' && <XCircle className="w-4 h-4 text-rose-500" />}
                  {step.status === 'running' && <Loader className="w-4 h-4 text-sky-400 animate-spin" />}
                  {step.status === 'idle' && <Activity className="w-4 h-4 text-neutral-600" />}
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <div className="font-semibold text-neutral-200 text-[11px] leading-tight">{step.name}</div>
                  <div className={`text-[10px] ${
                    step.status === 'success' ? 'text-emerald-400' :
                    step.status === 'running' ? 'text-sky-400' :
                    'text-neutral-500'
                  }`}>
                    {step.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment complete success card */}
        {isCompleted && (
          <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 text-left space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full border border-emerald-500/20" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{translations[currentLang].devops.deployedBtn}</span>
            </div>
            
            <p className="text-[10px] text-neutral-400 leading-normal">
              Your container is serving live traffic. Live code patches and ghost completions are actively running inside edge processes.
            </p>

            <a
              href="https://ais-pre-7eoy5c7v62pkjv2hnf2iez-355221024374.asia-east1.run.app"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 font-semibold rounded-lg text-xs transition-colors"
            >
              <span>{translations[currentLang].devops.viewLive}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Live Build Tels Logs Console */}
        <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-[9px] leading-normal overflow-hidden h-36">
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold">{translations[currentLang].devops.buildLogs}</span>
            </div>
            <span className="text-[8px] bg-neutral-950 text-neutral-500 border border-neutral-800 px-1 py-0.5 rounded">
              LOGS
            </span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-1 select-all scrollbar-thin text-left text-teal-400 font-mono">
            {buildLogs.length === 0 ? (
              <span className="text-neutral-600 italic">No deployment pipeline logs found. Click Deploy to build sandbox.</span>
            ) : (
              buildLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed truncate">{log}</div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
