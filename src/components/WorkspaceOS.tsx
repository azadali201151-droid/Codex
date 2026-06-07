/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  GitBranch, 
  Server, 
  Terminal as TerminalIcon, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Activity, 
  ExternalLink, 
  Unlock, 
  Lock, 
  Check, 
  Sparkles,
  Users,
  MessageSquare,
  AlertTriangle,
  Github,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Bot,
  Home,
  Save,
  Trash2,
  Plus,
  Search,
  Code,
  Layout,
  RefreshCw,
  Info,
  Bug,
  Keyboard,
  Settings,
  Sliders,
  Maximize2,
  Layers,
  X,
  History,
  FileText
} from 'lucide-react';
import { CodeFile, Collaborator } from '../types';
import { ProjectTemplate } from './ProjectTemplates';
import FileTree from './FileTree';
import GithubIntegration from './GithubIntegration';
import DeploymentPipeline from './DeploymentPipeline';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceOSProps {
  activeFile: CodeFile | null;
  activeTemplate: ProjectTemplate;
  templates: ProjectTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
  onMoveFile?: (fileId: string, newPath: string) => void;
  onFileContentChange: (newContent: string) => void;
  onApplyCodePatch: (patchedCode: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
  collaborators: Collaborator[];
  simulatingCollaboration: boolean;
  setSimulatingCollaboration: React.Dispatch<React.SetStateAction<boolean>>;
  globalStatus: string;
  setGlobalStatus: (status: string) => void;
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  aiPanel: React.ReactNode;
  onGoBackToLanding?: () => void;
}

// Terminal Log Interface
interface TermLog {
  text: string;
  type: 'system' | 'info' | 'output' | 'error' | 'success' | 'input' | 'neutral';
  time: string;
}

// Workspace Snapshot Interface
interface WorkspaceSnapshot {
  id: string;
  name: string;
  time: string;
  activeFileId: string | null;
  activeSidebarTab: 'explorer' | 'github' | 'devops' | 'snapshots';
  panelState: {
    sidebar: boolean;
    preview: boolean;
    ai: boolean;
    terminal: boolean;
  };
}

export default function WorkspaceOS({
  activeFile,
  activeTemplate,
  templates,
  onSelectTemplate,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onFileContentChange,
  currentLang,
  collaborators,
  simulatingCollaboration,
  setSimulatingCollaboration,
  globalStatus,
  setGlobalStatus,
  editorPanel,
  previewPanel,
  aiPanel,
  onGoBackToLanding
}: WorkspaceOSProps) {
  // Navigation tab for the Left Sidebar: 'explorer' | 'github' | 'devops' | 'snapshots'
  const [activeTab, setActiveTab] = useState<'explorer' | 'github' | 'devops' | 'snapshots'>('explorer');
  
  // Panel state models with full layout persistence (defaults to fully visible elements for desktop/laptop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return true;
    const val = localStorage.getItem('codex_is_sidebar_open');
    return val !== 'false';
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return true;
    const val = localStorage.getItem('codex_is_preview_open');
    return val !== 'false';
  });
  const [isAiOpen, setIsAiOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return true;
    const val = localStorage.getItem('codex_is_ai_open');
    return val !== 'false';
  });
  const [isTerminalOpen, setIsTerminalOpen] = useState(() => {
    const val = localStorage.getItem('codex_is_terminal_open');
    return val !== 'false';
  });

  // Custom Split-Pane Drag Dimensions (optimized with ideal compact layout initial parameters)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const val = localStorage.getItem('codex_sidebar_width');
    return val ? parseInt(val) : 240;
  });
  const [aiWidth, setAiWidth] = useState(() => {
    const val = localStorage.getItem('codex_ai_width');
    return val ? parseInt(val) : 320;
  });
  const [previewWidth, setPreviewWidth] = useState(() => {
    const val = localStorage.getItem('codex_preview_width');
    return val ? parseInt(val) : 380;
  });
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const val = localStorage.getItem('codex_terminal_height');
    return val ? parseInt(val) : 200;
  });

  // Mobile Swipe Section Layout Tabs: 'explorer' | 'editor' | 'ai' | 'preview' | 'terminal'
  const [mobileTab, setMobileTab] = useState<'explorer' | 'editor' | 'ai' | 'preview' | 'terminal'>('editor');
  const [isMobile, setIsMobile] = useState(true);

  // Command Palette & Key Bindings Overlay
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Workspace Layout Zen Mode & Spatial Docking Presets
  const [isZenMode, setIsZenMode] = useState(() => {
    try {
      return localStorage.getItem('codex_is_zen_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [spatialPreset, setSpatialPreset] = useState<'classical' | 'quad' | 'bento' | 'focused'>('classical');

  // Bottom Shell State (Terminal + Log Tracer + Rust Core AST Graph)
  const [terminalTab, setTerminalTab] = useState<'terminal' | 'problems' | 'logs' | 'rust_core'>('terminal');
  const [terminalTheme, setTerminalTheme] = useState<'classic' | 'neon' | 'aurora'>('classic');
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<TermLog[]>([
    { text: 'Workspace session initialized successfully.', type: 'system', time: '09:00:00' },
    { text: 'Loading code compilers, linter modules, and file sync watchers...', type: 'info', time: '09:00:01' },
    { text: 'Web dev server loaded on port 3000. Ready for user operations.', type: 'success', time: '09:00:02' }
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  // Workspace Snapshots Store
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>(() => {
    const val = localStorage.getItem('codex_snapshots');
    if (val) {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [
      {
        id: 'snap-default',
        name: 'Workspace Baseline Spec',
        time: '31 May 2026, 09:00',
        activeFileId: activeFile?.id || null,
        activeSidebarTab: 'explorer',
        panelState: { sidebar: true, preview: true, ai: true, terminal: true }
      }
    ];
  });
  const [newSnapshotName, setNewSnapshotName] = useState('');

  // Auto Zoom level tracking
  const [zoomLevel, setZoomLevel] = useState<'auto' | '100' | '85' | '75' | '65' | '50'>('auto');
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  // Rotate global system tracer logs states
  const [systemAlert, setSystemAlert] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Save states to persistent memory
  useEffect(() => {
    localStorage.setItem('codex_is_sidebar_open', String(isSidebarOpen));
    localStorage.setItem('codex_is_preview_open', String(isPreviewOpen));
    localStorage.setItem('codex_is_ai_open', String(isAiOpen));
    localStorage.setItem('codex_is_terminal_open', String(isTerminalOpen));
  }, [isSidebarOpen, isPreviewOpen, isAiOpen, isTerminalOpen]);

  useEffect(() => {
    localStorage.setItem('codex_sidebar_width', String(sidebarWidth));
    localStorage.setItem('codex_ai_width', String(aiWidth));
    localStorage.setItem('codex_preview_width', String(previewWidth));
    localStorage.setItem('codex_terminal_height', String(terminalHeight));
  }, [sidebarWidth, aiWidth, previewWidth, terminalHeight]);

  useEffect(() => {
    localStorage.setItem('codex_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  // Force all essential panels open when mounting on desktop & laptop for complete screen visibility
  useEffect(() => {
    const width = window.innerWidth;
    if (width >= 768) {
      setIsSidebarOpen(true);
      setIsPreviewOpen(true);
      setIsAiOpen(true);
    }
  }, []);

  // Handle responsive screens, mobile states and auto zoom scaling adaptors
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileDevice = true; // Always use mobile layout as requested
      setIsMobile(isMobileDevice);

      if (zoomLevel === 'auto') {
        if (isMobileDevice) {
          // Phones get full swipe tabs panel - scale remains 1 so interactive nodes build beautifully inside native ports
          setScaleFactor(1.0);
        } else {
          // Compact laptop & screen optimization: if total widths squeeze the editor below 380px,
          // we proportionally scale down everything so that some portions are scaled to fit perfectly on screen
          const ribbonWidth = 44;
          const minEditorWidth = 380;
          const currentSidebar = isSidebarOpen ? sidebarWidth : 0;
          const currentPreview = isPreviewOpen ? previewWidth : 0;
          const currentAi = isAiOpen ? aiWidth : 0;

          const totalUnscaledWidth = ribbonWidth + currentSidebar + currentPreview + currentAi + minEditorWidth;

          if (width < totalUnscaledWidth) {
            // Apply scale factor smoothly so everything fits perfectly on laptop or desktop screens.
            // A safety cushion of 16px ensures absolutely no horizontal scrollbars.
            const ratio = (width - 16) / totalUnscaledWidth;
            // Cap minimum scale factor to 0.65 to keep typography highly readable
            setScaleFactor(Math.max(0.65, ratio));
          } else {
            setScaleFactor(1.0);
          }
        }
      } else {
        setScaleFactor(parseInt(zoomLevel) / 100);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoomLevel, isSidebarOpen, isPreviewOpen, isAiOpen, sidebarWidth, previewWidth, aiWidth]);

  // Sync active file triggers mobile view tab redirection to Editor
  useEffect(() => {
    if (activeFile && isMobile) {
      setMobileTab('editor');
    }
  }, [activeFile]);

  // Listen to keyboard-first shortcuts: ⌘K or Ctrl+K for palette, ESC to close, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
      // ESC
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setShowKeyboardHelp(false);
      }
      // Alt+S for sidebar
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
        setGlobalStatus(isSidebarOpen ? 'Collapsed file tree sidebar.' : 'Expanded files sidebar.');
      }
      // Alt+P for Live Preview
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreviewOpen(prev => !prev);
        setGlobalStatus(isPreviewOpen ? 'Collapsed live render viewport.' : 'Opened developer sandbox viewport.');
      }
      // Alt+A for AI panel
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAiOpen(prev => !prev);
        setGlobalStatus(isAiOpen ? 'Hidden AI Assistant drawer.' : 'Enabled AI companion workspace assistance.');
      }
      // Alt+T for Bottom Terminal
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      // Alt+Z for Zen Mode Toggle
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
        setGlobalStatus(!isZenMode ? 'Zen Mode engaged: Hover screen margins to trigger navigation widgets.' : 'Universal Workspace layouts restored.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isPreviewOpen, isAiOpen, isTerminalOpen, isZenMode]);

  // Sync Zen Mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codex_is_zen_mode', String(isZenMode));
    } catch (e) {}
  }, [isZenMode]);

  // Spatial Dock Layout Preset Optimizer
  const applySpatialPreset = (preset: 'classical' | 'quad' | 'bento' | 'focused') => {
    setSpatialPreset(preset);
    
    if (preset === 'classical') {
      setIsSidebarOpen(true);
      setIsPreviewOpen(true);
      setIsAiOpen(true);
      setIsTerminalOpen(true);
      setSidebarWidth(240);
      setAiWidth(320);
      setPreviewWidth(380);
      setTerminalHeight(200);
      setGlobalStatus('Classical workspace columns layout restored.');
    } else if (preset === 'quad') {
      setIsSidebarOpen(true);
      setIsPreviewOpen(true);
      setIsAiOpen(true);
      setIsTerminalOpen(true);
      // Equal split mathematically
      const third = Math.floor(window.innerWidth / 4.2);
      setSidebarWidth(Math.max(third - 30, 190));
      setPreviewWidth(Math.max(third, 310));
      setAiWidth(Math.max(third, 290));
      setTerminalHeight(240);
      setGlobalStatus('Symmetrical Quad-dock layout manager engaged.');
    } else if (preset === 'focused') {
      setIsSidebarOpen(false);
      setIsPreviewOpen(false);
      setIsAiOpen(false);
      setIsTerminalOpen(false);
      setGlobalStatus('Zen Focus Mode: Expanded primary editor canvas.');
    } else if (preset === 'bento') {
      setIsSidebarOpen(true);
      setIsPreviewOpen(true);
      setIsAiOpen(false); // Minimized AI tool split to leave coding and preview layout space
      setIsTerminalOpen(true);
      setSidebarWidth(210);
      setPreviewWidth(410);
      setTerminalHeight(230);
      setGlobalStatus('Bento Grid layout optimized for direct preview feedback.');
    }
  };

  // Autoscroll terminal shell output list
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, compileProgress]);

  // Rotatory statuses
  useEffect(() => {
    if (globalStatus) {
      setSystemAlert(globalStatus);
      const timer = setTimeout(() => setSystemAlert(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [globalStatus]);

  // Real-time compilation simulator
  const runCompilePipeline = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setCompileProgress(5);
    setTerminalTab('terminal');
    
    setTerminalLogs(prev => [
      ...prev,
      { text: `npm run build:${activeTemplate.id}`, type: 'input', time: new Date().toLocaleTimeString() },
      { text: `🚀 Initializing bundling sequencer for [${activeTemplate.name}]...`, type: 'info', time: Date().slice(16, 24) }
    ]);

    const intervals = [15, 30, 55, 75, 90, 100];
    let step = 0;

    const timer = setInterval(() => {
      if (step < intervals.length) {
        const val = intervals[step];
        setCompileProgress(val);
        
        if (val === 30) {
          setTerminalLogs(prev => [...prev, { text: '📦 Bundled index.html & static dependencies assets (Vite dev mode dynamic loader).', type: 'output', time: Date().slice(16, 24) }]);
        } else if (val === 55) {
          setTerminalLogs(prev => [...prev, { text: '⚙️ Parsing ES module type stripping declarations for source nodes...', type: 'output', time: Date().slice(16, 24) }]);
        } else if (val === 75) {
          // List files parsed
          setTerminalLogs(prev => [...prev, { text: `✅ Compiled successfully ${activeTemplate.files.length} module components with TS NoEmit declarations.`, type: 'success', time: Date().slice(16, 24) }]);
        } else if (val === 100) {
          setTerminalLogs(prev => [...prev, { text: '✨ Execution container hot reload completes. Server running at port 3000.', type: 'success', time: Date().slice(16, 24) }]);
          setIsCompiling(false);
          setCompileProgress(0);
          setGlobalStatus('Workspace sandbox built successfully!');
          clearInterval(timer);
        }
        step++;
      }
    }, 400);
  };

  // Drag handles for Desktop Column layouts with smart constraints protecting Code Editor space
  const startSidebarDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const screenWidth = window.innerWidth;
    const ribbonWidth = 44;
    const previewCol = isPreviewOpen ? previewWidth : 0;
    const aiCol = isAiOpen ? aiWidth : 0;
    const minEditorWidth = 350;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const maxAllowedWidth = screenWidth - ribbonWidth - previewCol - aiCol - minEditorWidth;
      const newWidth = Math.min(Math.max(180, moveEvent.clientX), Math.max(180, maxAllowedWidth));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const startAiDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const screenWidth = window.innerWidth;
    const ribbonWidth = 44;
    const sidebarCol = isSidebarOpen ? sidebarWidth : 0;
    const previewCol = isPreviewOpen ? previewWidth : 0;
    const minEditorWidth = 350;
    const startX = e.clientX;
    const startWidth = aiWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const maxAllowedWidth = screenWidth - ribbonWidth - sidebarCol - previewCol - minEditorWidth;
      const newWidth = Math.min(Math.max(200, startWidth - delta), Math.max(200, maxAllowedWidth));
      setAiWidth(newWidth);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const startPreviewDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const screenWidth = window.innerWidth;
    const ribbonWidth = 44;
    const sidebarCol = isSidebarOpen ? sidebarWidth : 0;
    const aiCol = isAiOpen ? aiWidth : 0;
    const minEditorWidth = 350;
    const startX = e.clientX;
    const startWidth = previewWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const maxAllowedWidth = screenWidth - ribbonWidth - sidebarCol - aiCol - minEditorWidth;
      const newWidth = Math.min(Math.max(220, startWidth - delta), Math.max(220, maxAllowedWidth));
      setPreviewWidth(newWidth);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const startTerminalDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.min(450, Math.max(100, startHeight - delta));
      setTerminalHeight(newHeight);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Simulated Terminal Shell Command Executor
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const query = commandInput.trim();
    const cmdArgs = query.split(' ');
    const primaryCmd = cmdArgs[0].toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    // Register command line input
    const addedLogs: TermLog[] = [
      { text: `$ ${query}`, type: 'input', time: timestamp }
    ];

    switch (primaryCmd) {
      case 'help':
        addedLogs.push(
          { text: '📚 Available Virtual terminal shell commands:', type: 'info', time: timestamp },
          { text: '  ls                   - List files inside the current sandbox template directory.', type: 'neutral', time: timestamp },
          { text: '  cat [filename]       - Display source structure for any specific sandbox file.', type: 'neutral', time: timestamp },
          { text: '  compile or build     - Run the typescript build sequencer build cycle.', type: 'neutral', time: timestamp },
          { text: '  git status           - Review local git branch sync commits and modified flags.', type: 'neutral', time: timestamp },
          { text: '  snapshots            - List active local snapshot records available.', type: 'neutral', time: timestamp },
          { text: '  theme [aurora|neon]  - Swap Terminal accent themes instantly.', type: 'neutral', time: timestamp },
          { text: '  clear                - Flush console terminal log tracer histories.', type: 'neutral', time: timestamp }
        );
        break;
      case 'ls':
        addedLogs.push(
          { text: `📂 Directory listing of [${activeTemplate.name}]:`, type: 'info', time: timestamp },
          ...activeTemplate.files.map(file => ({
            text: `  📄 ${file.name}              (${file.language.toUpperCase()} File, ${file.content.length} Bytes)`,
            type: 'output' as const,
            time: timestamp
          }))
        );
        break;
      case 'cat':
        if (!cmdArgs[1]) {
          addedLogs.push({ text: '🚫 Error: Please specify file path. Example: cat index.html', type: 'error', time: timestamp });
        } else {
          const targetName = cmdArgs[1].toLowerCase();
          const found = activeTemplate.files.find(f => f.name.toLowerCase() === targetName || f.path.toLowerCase() === targetName);
          if (found) {
            addedLogs.push(
              { text: `📖 File Contents of [${found.name}]:`, type: 'info', time: timestamp },
              { text: found.content, type: 'neutral', time: timestamp }
            );
          } else {
            addedLogs.push({ text: `❌ Error: Specified file "${cmdArgs[1]}" not found in directory.`, type: 'error', time: timestamp });
          }
        }
        break;
      case 'compile':
      case 'build':
        setTimeout(runCompilePipeline, 100);
        break;
      case 'git':
        if (cmdArgs[1] === 'status') {
          addedLogs.push(
            { text: `🎋 Active Git Branch: main               (Pinned upstream: origin/main)`, type: 'info', time: timestamp },
            { text: 'Changes staged for commit:', type: 'success', time: timestamp },
            { text: '  (use "git reset HEAD <file>..." to unstage)', type: 'neutral', time: timestamp },
            { text: `     modified:   ${activeFile ? activeFile.path : 'src/App.tsx'}`, type: 'output', time: timestamp },
            { text: 'Your branch is fully synced to GitHub. Remote triggers online.', type: 'success', time: timestamp }
          );
        } else {
          addedLogs.push({ text: '💡 Suggestion: Try typing "git status" to inspect repo branches.', type: 'info', time: timestamp });
        }
        break;
      case 'snapshots':
        addedLogs.push(
          { text: `📝 Snapshot History tracker (${snapshots.length} instances):`, type: 'info', time: timestamp },
          ...snapshots.map(s => ({
            text: `  💾 "${s.name}"  (Created: ${s.time} - Sidebar: ${s.activeSidebarTab})`,
            type: 'neutral' as const,
            time: timestamp
          }))
        );
        break;
      case 'theme':
        const selected = cmdArgs[1]?.toLowerCase();
        if (selected === 'neon' || selected === 'aurora' || selected === 'classic') {
          setTerminalTheme(selected as 'classic' | 'neon' | 'aurora');
          addedLogs.push({ text: `🎨 Terminal skin swapped to [${selected.toUpperCase()}].`, type: 'success', time: timestamp });
        } else {
          addedLogs.push({ text: '⚠️ Please select a correct theme: classic, neon, aurora.', type: 'error', time: timestamp });
        }
        break;
      case 'clear':
        setTerminalLogs([]);
        setCommandInput('');
        return;
      default:
        addedLogs.push({ text: `❌ bash: command "${query}" was not found. Please type "help" to view options.`, type: 'error', time: timestamp });
        break;
    }

    setTerminalLogs(prev => [...prev, ...addedLogs]);
    setCommandInput('');
  };

  // Snapshot Engine Actions
  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;

    const newSnap: WorkspaceSnapshot = {
      id: `snap-${Date.now()}`,
      name: newSnapshotName.trim(),
      time: new Date().toLocaleString(),
      activeFileId: activeFile?.id || null,
      activeSidebarTab: activeTab === 'snapshots' ? 'explorer' : activeTab,
      panelState: {
        sidebar: isSidebarOpen,
        preview: isPreviewOpen,
        ai: isAiOpen,
        terminal: isTerminalOpen
      }
    };

    setSnapshots([newSnap, ...snapshots]);
    setNewSnapshotName('');
    setGlobalStatus(`Saved sandbox snapshot "${newSnap.name}" successfully.`);
  };

  const handleApplySnapshot = (snap: WorkspaceSnapshot) => {
    setIsSidebarOpen(snap.panelState.sidebar);
    setIsPreviewOpen(snap.panelState.preview);
    setIsAiOpen(snap.panelState.ai);
    setIsTerminalOpen(snap.panelState.terminal);
    if (snap.activeSidebarTab !== 'snapshots') {
      setActiveTab(snap.activeSidebarTab as any);
    }
    if (snap.activeFileId) {
      onSelectFile(snap.activeFileId);
    }
    setGlobalStatus(`Applied Snapshot: "${snap.name}"`);
  };

  const handleDeleteSnapshot = (id: string) => {
    if (snapshots.length <= 1) {
      setGlobalStatus('Cannot delete the primary workspace fallback baseline snapshot.');
      return;
    }
    setSnapshots(prev => prev.filter(s => s.id !== id));
    setGlobalStatus('Deleted snapshot record.');
  };

  // Palette select handlers
  const handlePaletteSelectFile = (fileId: string) => {
    onSelectFile(fileId);
    setIsPaletteOpen(false);
    setPaletteSearch('');
  };

  // Keyboard Navigation Helpers items
  const menuKeyboardShortcuts = [
    { keys: ['⌘ K', 'Ctrl K'], label: 'Open Command Palette' },
    { keys: ['Alt S'], label: 'Toggle Files Sidebar' },
    { keys: ['Alt P'], label: 'Toggle Live Preview' },
    { keys: ['Alt A'], label: 'Toggle Copilot Assistant' },
    { keys: ['Alt T'], label: 'Toggle Bottom Terminal' },
    { keys: ['Esc'], label: 'Close Active Modals' }
  ];

  // Problems simulated scanner feedback calculated based on actual template source length
  const workspaceProblems = [
    {
      id: 'p1',
      source: 'App.tsx',
      severity: 'warning' as const,
      line: 39,
      msg: 'Statically defined model presets is currently offline. Relying on active client state managers.'
    },
    {
      id: 'p2',
      source: 'WorkspaceOS.tsx',
      severity: 'info' as const,
      line: 110,
      msg: 'Automatic scale-factor zooms optimized configurations according.'
    }
  ];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-brand-main text-text-primary h-full select-none">
      
      {/* ━━━━━━━━━━━━━━━━ DESIGNED DESKTOP VIEW CONTROL HEADER BAR ━━━━━━━━━━━━━━━━ */}
      <div className={`h-14 border-b border-border-subtle bg-brand-main flex items-center justify-between px-3 md:px-4 text-xs shrink-0 select-none z-30 transition-all duration-300 ${
        isZenMode 
          ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 h-14 select-none justify-between border-b border-border-subtle bg-[#0B1020]/95 duration-200 shadow-2xl' 
          : 'relative'
      }`}>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Home action */}
          {onGoBackToLanding && (
            <button
              onClick={onGoBackToLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-secondary hover:bg-brand-card text-text-secondary hover:text-[#FFFFFF] border border-border-subtle rounded-[8px] text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-sm"
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-accent-blue" />
              <span className="hidden sm:inline">{translations[currentLang].ide.home}</span>
            </button>
          )}

          {/* Quick Active template status details */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-text-muted hidden sm:inline">Template:</span>
            <span className="text-[10px] font-bold bg-[#4F8CFF]/10 text-accent-blue border border-[#4F8CFF]/15 px-2.5 py-1 rounded-[6px] font-mono truncate max-w-[150px] md:max-w-[240px]">
              {activeTemplate.name}
            </span>
          </div>

          {/* Active file indicator badge */}
          {activeFile && (
            <div className="hidden md:flex items-center gap-1.5 bg-brand-secondary text-text-secondary px-2.5 py-1 rounded-[6px] border border-border-subtle font-mono text-[10px]">
              <FileText className="w-3.5 h-3.5 text-accent-blue" />
              <span className="text-text-primary font-bold">{activeFile.name}</span>
            </div>
          )}
        </div>

        {/* Global panel layouts config tools */}
        <div className="flex items-center gap-1.5 font-sans">
          
          {/* Spatial Grid Docking Preset Selectors */}
          <div className="flex items-center gap-1 bg-brand-secondary border border-border-subtle p-1 rounded-[10px] select-none font-sans">
            <span className="text-[9px] text-text-secondary font-extrabold tracking-wider uppercase px-2 hidden md:inline">Dock:</span>
            {(['classical', 'quad', 'bento', 'focused'] as const).map(p => (
              <button
                key={p}
                onClick={() => applySpatialPreset(p)}
                className={`px-2.5 py-1 rounded-[8px] text-[9px] font-black uppercase transition-all cursor-pointer ${
                  spatialPreset === p
                    ? 'bg-accent-blue text-brand-main font-bold shadow-md shadow-accent-blue/15'
                    : 'text-text-secondary hover:text-text-primary hover:bg-brand-card'
                }`}
                title={`Switch layout to "${p}" mode`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Invisible UI Zen mode switcher */}
          <button
            onClick={() => {
              setIsZenMode(p => !p);
              setGlobalStatus(!isZenMode ? 'Invisible UI engaged. Hover margins to view controls.' : 'Standard layout ribbons restored.');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase rounded-[8px] border transition-all cursor-pointer ${
              isZenMode
                ? 'bg-success/15 border-success/30 text-success hover:text-success'
                : 'bg-brand-secondary border-border-subtle text-text-secondary hover:text-[#FFFFFF]'
            }`}
            title="Toggle Zen Mode: Completely hide all visual chrome and headers by default (hover margins to reveal)"
          >
            {isZenMode ? <EyeOff className="w-3.5 h-3.5 text-success bg-transparent shrink-0" /> : <Eye className="w-3.5 h-3.5 text-accent-blue bg-transparent shrink-0" />}
            <span className="hidden sm:inline">{isZenMode ? 'Zen: ON' : 'Zen: OFF'}</span>
          </button>

          {/* Snapshots overlay launcher button */}
          <button
            onClick={() => {
              setActiveTab('snapshots');
              setIsSidebarOpen(true);
              setGlobalStatus('Opened Snapshots directory tree.');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-secondary hover:bg-brand-card border border-border-subtle text-text-secondary hover:text-[#FFFFFF] rounded-[8px] text-[9px] font-bold cursor-pointer transition-all shadow-sm"
            title="Manage Workspace snapshots"
          >
            <History className="w-3.5 h-3.5 text-accent-blue" />
            <span className="hidden lg:inline">Snapshots ({snapshots.length})</span>
          </button>

          {/* Command Palette trigger layout button */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0B1020] hover:bg-brand-card border border-border-subtle text-text-secondary hover:text-accent-blue rounded-[8px] text-[9px] font-bold cursor-pointer transition-all shadow-sm"
            title="Open command palette (Ctrl+K)"
          >
            <Keyboard className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-[8px] uppercase text-text-muted hidden sm:inline">Ctrl+K</span>
            <span className="hidden sm:inline">Palette</span>
          </button>

          {/* Compilation initiator tool */}
          <button
            onClick={runCompilePipeline}
            disabled={isCompiling}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase rounded-[8px] text-[#FFFFFF] transition-all cursor-pointer ${
              isCompiling 
                ? 'bg-brand-secondary text-text-muted border border-border-subtle cursor-not-allowed' 
                : 'bg-accent-blue hover:bg-accent-hover shadow-[0_2px_10px_rgba(79,140,255,0.25)]'
            }`}
            title="Simulate complete local build compiler pipeline"
          >
            {isCompiling ? <Loader className="w-3.5 h-3.5 animate-spin text-text-muted" /> : <Play className="w-3.5 h-3.5 text-white fill-current" />}
            <span>{isCompiling ? 'Building' : 'Compile App'}</span>
          </button>

          {/* Desktop specific pane toggle switch items */}
          {!isMobile && (
            <div className="hidden sm:flex items-center gap-1.5 ml-1 pl-2 border-l border-border-subtle">
              {/* Toggle Sidebar */}
              <button 
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className={`p-1.5 rounded-[8px] cursor-pointer transition-all border ${
                  isSidebarOpen ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_8px_rgba(79,140,255,0.1)]' : 'text-text-[#64748B] hover:text-[#FFFFFF] bg-brand-secondary border-border-subtle'
                }`}
                title="Files Panel toggle"
              >
                <Folder className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Terminal Bottom */}
              <button 
                onClick={() => setIsTerminalOpen(prev => !prev)}
                className={`p-1.5 rounded-[8px] cursor-pointer transition-all border ${
                  isTerminalOpen ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_8px_rgba(79,140,255,0.1)]' : 'text-text-[#64748B] hover:text-[#FFFFFF] bg-brand-secondary border-border-subtle'
                }`}
                title="Terminal Pane toggle"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Live Preview */}
              <button 
                onClick={() => setIsPreviewOpen(prev => !prev)}
                className={`p-1.5 rounded-[8px] cursor-pointer transition-all border ${
                  isPreviewOpen ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_8px_rgba(79,140,255,0.1)]' : 'text-text-[#64748B] hover:text-[#FFFFFF] bg-brand-secondary border-border-subtle'
                }`}
                title="Live Preview Viewport toggle"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Toggle AI Copilot */}
              <button 
                onClick={() => setIsAiOpen(prev => !prev)}
                className={`p-1.5 rounded-[8px] cursor-pointer transition-all border ${
                  isAiOpen ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_8px_rgba(79,140,255,0.1)]' : 'text-text-[#64748B] hover:text-[#FFFFFF] bg-brand-secondary border-border-subtle'
                }`}
                title="AI Copilot assistance toggle"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Compile Progress Bar indicator line */}
      {isCompiling && (
        <div className="h-0.5 w-full bg-brand-secondary shrink-0 relative overflow-hidden">
          <div 
            style={{ width: `${compileProgress}%` }} 
            className="h-full bg-accent-blue transition-all duration-300"
          />
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━ DESIGNED DESKTOP WORKSPACE LAYOUT PANELS SEQUENCE ━━━━━━━━━━━━━━━━ */}
      {!isMobile ? (
        <div className="flex-1 min-h-0 relative select-text bg-brand-main overflow-hidden">
          <div 
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'top left',
              width: `${100 / scaleFactor}%`,
              height: `${100 / scaleFactor}%`,
              minHeight: '100%'
            }}
            className="flex h-full divide-x divide-border-subtle relative"
          >
            
            {/* COLUMN 1: LEFT NAVIGATION COMPONENT & EXPANSION SIDEBAR DRAWERS */}
            {isSidebarOpen && (
              <div 
                style={{ width: `${sidebarWidth}px` }} 
                className="h-full shrink-0 flex divide-x divide-border-subtle select-text overflow-hidden relative"
              >
                {/* Left Mini Dock with tab icons */}
                <div className={`w-11 h-full bg-brand-sidebar flex flex-col items-center justify-between py-3 shrink-0 select-none transition-all duration-300 ${
                  isZenMode 
                    ? 'opacity-0 hover:opacity-100 absolute left-0 top-10 bottom-8 hover:bg-brand-sidebar/95 duration-200 z-40 shadow-2xl border-r border-border-subtle' 
                    : 'relative'
                }`}>
                  <div className="flex flex-col gap-4 items-center w-full">
                    
                    {/* Explorer Tab Icon */}
                    <button 
                      onClick={() => {
                        setActiveTab('explorer');
                        setGlobalStatus('Navigated to project explorer.');
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                        activeTab === 'explorer' 
                          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_8px_rgba(79,140,255,0.1)]' 
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                      title="Files Explorer Sidebar"
                    >
                      <Folder className="w-4 h-4" />
                      {activeTab === 'explorer' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-accent-blue rounded" />}
                    </button>

                    {/* Git Branch tab button */}
                    <button 
                      onClick={() => {
                        setActiveTab('github');
                        setGlobalStatus('Git system sync operations active.');
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                        activeTab === 'github' 
                          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_8px_rgba(79,140,255,0.1)]' 
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                      title="GitHub remote Git controller"
                    >
                      <Github className="w-4 h-4" />
                      {activeTab === 'github' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-accent-blue rounded" />}
                    </button>

                    {/* Server Deployment tab option */}
                    <button 
                      onClick={() => {
                        setActiveTab('devops');
                        setGlobalStatus('Deployment telemetry ready.');
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                        activeTab === 'devops' 
                          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_8px_rgba(79,140,255,0.1)]' 
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                      title="Deployment edge servers"
                    >
                      <Server className="w-4 h-4" />
                      {activeTab === 'devops' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-accent-blue rounded" />}
                    </button>

                    {/* Snapshots Tab Icon */}
                    <button 
                      onClick={() => {
                        setActiveTab('snapshots');
                        setGlobalStatus('Managing local snapshots.');
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                        activeTab === 'snapshots' 
                          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_8px_rgba(79,140,255,0.1)]' 
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                      title="Snapshots timeline history"
                    >
                      <History className="w-4 h-4" />
                      {activeTab === 'snapshots' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-accent-blue rounded" />}
                    </button>

                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center animate-pulse">
                      <Activity className="w-3 h-3 text-accent-blue" />
                    </div>
                  </div>
                </div>

                {/* Left Expanded Tab drawer window */}
                <div className="flex-1 h-full min-w-0 bg-brand-secondary flex flex-col overflow-hidden text-left relative">
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2 px-1">
                    {activeTab === 'explorer' && (
                      <FileTree
                        templates={templates}
                        activeTemplate={activeTemplate}
                        activeFile={activeFile}
                        onSelectTemplate={onSelectTemplate}
                        onSelectFile={onSelectFile}
                        onCreateFile={onCreateFile}
                        onDeleteFile={onDeleteFile}
                        currentLang={currentLang}
                      />
                    )}

                    {activeTab === 'github' && (
                      <GithubIntegration
                        activeFile={activeFile}
                        files={activeTemplate.files}
                        onSetGlobalStatus={setGlobalStatus}
                        currentLang={currentLang}
                      />
                    )}

                    {activeTab === 'devops' && (
                      <DeploymentPipeline
                        onSetGlobalStatus={setGlobalStatus}
                        currentLang={currentLang}
                      />
                    )}

                    {activeTab === 'snapshots' && (
                      <div className="p-3 select-none font-sans text-xs">
                        <div className="flex items-center gap-1.5 text-[#F8FAFC] uppercase font-semibold text-[10px] tracking-wider mb-2 font-mono">
                          <History className="w-3.5 h-3.5 text-accent-blue" />
                          <span>Workspace Snapshots</span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed mb-4">
                          Capture stable layouts, active editor documents, and local context to restore anytime.
                        </p>

                        <form onSubmit={handleSaveSnapshot} className="space-y-2 mb-4">
                          <input
                            type="text"
                            placeholder="Snapshot Title (e.g. Baseline Stage)"
                            value={newSnapshotName}
                            onChange={(e) => setNewSnapshotName(e.target.value)}
                            className="w-full bg-[#0B1020] border border-border-subtle rounded-[8px] px-2.5 py-1.5 text-[10px] text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 bg-brand-card border border-border-subtle hover:bg-[#15203B] text-accent-blue hover:text-[#FFFFFF] text-[10px] font-bold rounded-[8px] cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Current State</span>
                          </button>
                        </form>

                        <div className="space-y-2">
                          <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest font-mono">Saved snapshots</div>
                          {snapshots.length === 0 ? (
                            <div className="text-[10px] text-text-muted italic py-2">No active snap points found.</div>
                          ) : (
                            <div className="space-y-2">
                              {snapshots.map((snap) => (
                                <div 
                                  key={snap.id} 
                                  className="group border border-border-subtle bg-[#121A2E] hover:bg-[#1C2844] rounded-[10px] p-2.5 flex flex-col gap-1.5 transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-[#F8FAFC] text-[10px] truncate max-w-[150px]">{snap.name}</span>
                                    <button
                                      onClick={() => handleDeleteSnapshot(snap.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-error transition-all cursor-pointer"
                                      title="Delete snapshot"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-[8px] font-mono text-text-muted flex items-center justify-between">
                                    <span>{snap.time}</span>
                                    <button
                                      onClick={() => handleApplySnapshot(snap)}
                                      className="px-2.5 py-1 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-[#FFFFFF] border border-accent-blue/15 rounded-[6px] font-bold cursor-pointer transition-all text-[8px]"
                                    >
                                      Restore
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left sidebar horizontal drag handle */}
                <div 
                  onMouseDown={startSidebarDrag}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/40 bg-transparent active:bg-sky-400 z-30 transition-all duration-300"
                />
              </div>
            )}

            {/* COLUMN 2: CENTER WORKSPACE COLUMN (Code Editor + Bottom Terminal Tab Dashboard) */}
            <div className="flex-1 h-full min-w-0 flex flex-col bg-[#0B1020] select-text relative">
              
              {/* Upper Code Editor Node */}
              <div className="flex-1 min-h-0 relative">
                {editorPanel}
              </div>

              {/* Bottom Console Dashboard Container */}
              {isTerminalOpen && (
                <div 
                  style={{ height: `${terminalHeight}px` }}
                  className="w-full shrink-0 border-t border-[#1E293B] bg-brand-main flex flex-col relative overflow-hidden"
                >
                  
                  {/* Bottom Console tab switcher */}
                  <div className="h-9 border-b border-border-subtle bg-[#0F172A] flex items-center justify-between px-3 shrink-0 select-none font-mono">
                    <div className="flex items-center gap-1 text-[10px] h-full pt-1">
                      
                      {/* Terminal Interactive Shell tab */}
                      <button
                        onClick={() => setTerminalTab('terminal')}
                        className={`flex items-center gap-1.5 px-3.5 h-full text-[9px] font-extrabold uppercase transition-all tracking-wider border-b-2 cursor-pointer ${
                          terminalTab === 'terminal' 
                            ? 'text-accent-blue border-accent-blue bg-brand-main font-sans rounded-t-[8px]' 
                            : 'text-text-secondary hover:text-text-primary border-transparent font-sans'
                        }`}
                      >
                        <TerminalIcon className="w-3.5 h-3.5 text-accent-blue" />
                        <span>Interactive Bash</span>
                      </button>

                      {/* Problems listing diagnostics tab */}
                      <button
                        onClick={() => setTerminalTab('problems')}
                        className={`flex items-center gap-1.5 px-3.5 h-full text-[9px] font-extrabold uppercase transition-all tracking-wider border-b-2 cursor-pointer ${
                          terminalTab === 'problems' 
                            ? 'text-warning border-warning bg-brand-main font-sans rounded-t-[8px]' 
                            : 'text-text-secondary hover:text-text-primary border-transparent font-sans'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-warning animate-pulse" />
                        <span>Problems ({workspaceProblems.length})</span>
                      </button>

                      {/* Continuous Trace Pipeline Logs tab */}
                      <button
                        onClick={() => setTerminalTab('logs')}
                        className={`flex items-center gap-1.5 px-3.5 h-full text-[9px] font-extrabold uppercase transition-all tracking-wider border-b-2 cursor-pointer ${
                          terminalTab === 'logs' 
                            ? 'text-success border-success bg-brand-main font-sans rounded-t-[8px]' 
                            : 'text-text-secondary hover:text-text-primary border-transparent font-sans'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5 text-success" />
                        <span>Tracer Output</span>
                      </button>

                      {/* Simulated Rust AST Core tab */}
                      <button
                        onClick={() => {
                          setTerminalTab('rust_core');
                          setGlobalStatus('Synchronized live AST dependency graph inside local petgraph database.');
                        }}
                        className={`flex items-center gap-1.5 px-3.5 h-full text-[9px] font-bold uppercase transition-all tracking-wider border-b-2 cursor-pointer ${
                          terminalTab === 'rust_core' 
                            ? 'text-success border-success bg-brand-main font-sans rounded-t-[8px]' 
                            : 'text-[#94A3B8] hover:text-[#FFFFFF] border-transparent font-sans'
                        }`}
                        title="Simulated Rust Compiler Core (petgraph & Tree-sitter AST Graph Layout)"
                      >
                        <Layers className="w-3.5 h-3.5 text-success" />
                        <span>🦀 Core Engine Graph (Rust)</span>
                      </button>

                    </div>

                    {/* Extra logs console control parameters */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-[9px] text-[#64748B] font-sans font-bold">
                        <span>Console Active Theme:</span>
                        <div className="flex items-center gap-1 bg-brand-secondary p-0.5 rounded-[8px] border border-border-subtle">
                          {(['classic', 'neon', 'aurora'] as const).map(themeName => (
                            <button
                              key={themeName}
                              onClick={() => {
                                setTerminalTheme(themeName);
                                setGlobalStatus(`Set shell theme preset.`);
                              }}
                              className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black transition-all cursor-pointer ${
                                terminalTheme === themeName 
                                  ? 'bg-[#4F8CFF] text-[#FFFFFF] font-black shadow-sm' 
                                  : 'text-text-secondary hover:text-[#FFFFFF]'
                              }`}
                            >
                              {themeName.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trigger hot restart build simulator inside terminal */}
                      <button
                        onClick={runCompilePipeline}
                        disabled={isCompiling}
                        className="p-1.5 rounded-[8px] bg-brand-secondary hover:bg-brand-card border border-border-subtle text-accent-blue hover:text-white shadow-sm cursor-pointer transition-all"
                        title="Force build refresh bundle simulation"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin text-text-muted' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Interactively Loaded Tab Panels */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed no-scrollbar select-text selection:bg-[#4F8CFF]/20 bg-[#0B1020]">
                    
                    {/* Shell logs */}
                    {terminalTab === 'terminal' && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="space-y-1">
                          {terminalLogs.map((log, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-left">
                              <span className="text-[#475569] shrink-0 select-none font-bold text-[8px] mt-0.5">[{log.time}]</span>
                              <div className={`whitespace-pre-wrap ${
                                log.type === 'system' ? 'text-text-muted font-bold pb-1' :
                                log.type === 'info' ? 'text-accent-blue' :
                                log.type === 'output' ? 'text-[#E2E8F0]' :
                                log.type === 'input' ? 'text-text-primary font-bold' :
                                log.type === 'success' ? 'text-success font-semibold' : 'text-error'
                              }`}>
                                {log.text}
                              </div>
                            </div>
                          ))}
                          <div ref={terminalBottomRef} />
                        </div>
                        
                        {/* Interactive typed prompt prompt line */}
                        <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 border-t border-[#1E293B] pt-2.5 mt-2.5 select-text font-mono">
                          <span className={`${
                            terminalTheme === 'classic' ? 'text-text-secondary' :
                            terminalTheme === 'neon' ? 'text-accent-blue drop-shadow-[0_0_2px_rgba(79,140,255,0.5)]' :
                            'text-success drop-shadow-[0_0_2px_rgba(34,197,94,0.5)]'
                          } font-black select-none`}>$</span>
                          <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[#F8FAFC] placeholder-[#475569] text-[10px] font-mono leading-none caret-accent-blue select-text"
                            placeholder="Type interactive commands like 'ls', 'cat App.tsx', 'compile', 'git status', 'theme neon'..."
                          />
                        </form>
                      </div>
                    )}

                    {/* Diagnostics Problems pane */}
                    {terminalTab === 'problems' && (
                      <div className="space-y-3.5 text-left font-sans text-xs">
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary border-b border-border-subtle pb-2.5 mb-2 select-none uppercase font-extrabold font-mono tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-warning animate-bounce" />
                          <span>Active code linter diagnostic logs - Warnings Operational ({workspaceProblems.length} issues)</span>
                        </div>
                        {workspaceProblems.map((issue) => (
                          <div key={issue.id} className="p-3 border border-border-subtle bg-[#121A2E]/30 hover:bg-[#1A2645]/45 rounded-[10px] flex items-start gap-2.5 h-auto transition-all">
                            {issue.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                            ) : (
                              <Info className="w-4 h-4 text-accent-blue mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5">
                                <span className="font-extrabold text-[#F8FAFC] font-mono text-[10px] truncate hover:underline cursor-pointer">{issue.source} : Line {issue.line}</span>
                                <span className="text-[8px] px-2 py-0.5 bg-warning/10 text-warning border border-warning/15 rounded-[6px] font-mono font-extrabold uppercase">linter</span>
                              </div>
                              <p className="text-text-secondary text-[11px] mt-1 pr-2 leading-relaxed">{issue.msg}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Output logs continuous tracer streams */}
                    {terminalTab === 'logs' && (
                      <div className="space-y-3.5 text-left font-mono">
                        <div className="text-[10px] text-[#94A3B8] mb-2 select-none font-bold uppercase pb-2.5 border-b border-border-subtle tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-success" />
                          <span>Container VM runtime log streams - Active Watchers</span>
                        </div>
                        <div className="space-y-2 text-[10px] text-text-secondary">
                          <div className="flex items-start gap-2 leading-relaxed"><span className="text-success font-extrabold shrink-0">[WATCHER]</span><span>File system watch initialized successfully. Listening on workspace roots...</span></div>
                          <div className="flex items-start gap-2 leading-relaxed"><span className="text-accent-blue font-extrabold shrink-0">[SYNC]</span><span>Metadata parameters verified: {activeTemplate.name} / Sandbox version stable.</span></div>
                          {activeFile && (
                            <div className="flex items-start gap-2 leading-relaxed"><span className="text-accent-blue font-extrabold shrink-0">[RUNTIME]</span><span>Opened local stream pointer to active document workspace: <span className="text-[#F8FAFC] font-extrabold">"{activeFile.path}"</span></span></div>
                          )}
                          <div className="flex items-start gap-2 leading-relaxed"><span className="text-[#64748B] font-extrabold shrink-0">[METADATA]</span><span>Capabilities verification: MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API linked successfully to local backend proxy triggers.</span></div>
                        </div>
                      </div>
                    )}
                    {terminalTab === 'rust_core' && (
                      <div className="flex flex-col md:flex-row h-full w-full gap-4 text-left p-1 select-none font-sans">
                        {/* Interactive Graph Display */}
                        <div className="flex-1 min-h-[160px] bg-brand-secondary border border-border-subtle rounded-[10px] p-3 flex flex-col relative overflow-hidden">
                          <div className="text-[9px] uppercase tracking-wider text-success font-bold font-mono mb-2 flex flex-row items-center justify-between">
                            <span>🦀 Local Workspace Graph (petgraph representation)</span>
                            <span className="text-[7px] text-text-muted bg-[#0B1020] px-1.5 py-0.5 border border-border-subtle rounded">Tree-sitter AST</span>
                          </div>
                          
                          {/* Animated SVG Nodes map */}
                          <div className="flex-1 flex items-center justify-center relative">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '120px' }}>
                              <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" />
                                </marker>
                              </defs>
                              
                              {/* Connector links paths (bezier curves) */}
                              <line x1="18%" y1="50%" x2="50%" y2="20%" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="18%" y1="50%" x2="50%" y2="50%" stroke="#22C55E" strokeWidth="1" />
                              <line x1="18%" y1="50%" x2="50%" y2="80%" stroke="#22C55E" strokeWidth="1" />
                              <line x1="50%" y1="20%" x2="82%" y2="50%" stroke="#22C55E" strokeDasharray="3" strokeWidth="1" />
                              <line x1="50%" y1="50%" x2="82%" y2="50%" stroke="#22C55E" strokeWidth="1.5" />
                              <line x1="50%" y1="80%" x2="82%" y2="50%" stroke="#22C55E" strokeWidth="1" />
                            </svg>

                            <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-6">
                              {/* Left Root Column Node */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <span className="text-[8px] font-mono text-text-muted">Root Node</span>
                                <div className="w-8 h-8 rounded-full bg-success/10 border border-success flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.25)] relative cursor-pointer">
                                  <div className="absolute -inset-1 rounded-full border border-success/15 animate-ping" />
                                  <span className="text-[9px] font-mono text-success font-bold">&gt;_</span>
                                </div>
                                <span className="text-[8px] font-bold text-[#F8FAFC] font-mono shrink-0">Baseline</span>
                              </div>

                              {/* Middle Graph parser and rope modules Column Nodes */}
                              <div className="flex flex-col justify-around h-full py-0.5 gap-1 shrink-0">
                                <div className="flex flex-row items-center gap-1.5">
                                  <div className="w-5.5 h-5.5 rounded-lg bg-[#0B1020] border border-success/60 flex items-center justify-center cursor-pointer hover:bg-success/15 transition-all select-none">
                                    <span className="text-[8px] text-success font-mono font-bold">Rp</span>
                                  </div>
                                  <span className="text-[8px] text-text-secondary font-mono">ropey-buf</span>
                                </div>
                                <div className="flex flex-row items-center gap-1.5">
                                  <div className="w-5.5 h-5.5 rounded-lg bg-[#0B1020] border border-accent-blue/55 flex items-center justify-center cursor-pointer hover:bg-accent-blue/15 transition-all select-none">
                                    <span className="text-[8px] text-accent-blue font-mono font-bold">TS</span>
                                  </div>
                                  <span className="text-[8px] text-text-secondary font-mono">tree-sit</span>
                                </div>
                                <div className="flex flex-row items-center gap-1.5">
                                  <div className="w-5.5 h-5.5 rounded-lg bg-[#0B1020] border border-warning/50 flex items-center justify-center cursor-pointer hover:bg-warning/15 transition-all select-none">
                                    <span className="text-[8px] text-warning font-mono font-bold">LP</span>
                                  </div>
                                  <span className="text-[8px] text-text-secondary font-mono">lsp-ast</span>
                                </div>
                              </div>

                              {/* Right AST Leaves nodes Column Node */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <span className="text-[8px] font-mono text-text-muted">Target Segment</span>
                                <div 
                                  onClick={() => {
                                    if (activeFile) {
                                      onSelectFile(activeFile.id);
                                    }
                                    setGlobalStatus('Tree-sitter AST refreshed workspace references recursively.');
                                  }}
                                  className="w-8 h-8 rounded-full bg-accent-blue/10 border border-[#4F8CFF] hover:bg-[#4F8CFF] hover:text-black hover:scale-105 duration-200 flex items-center justify-center cursor-pointer segment-pulse"
                                  title="Click to parsed modules trigger recursive linter scans"
                                >
                                  <span className="text-[9px] text-[#4F8CFF] font-mono font-bold hover:text-black">🦀</span>
                                </div>
                                <span className="text-[8px] font-extrabold text-[#F8FAFC] font-mono shrink-0 max-w-[55px] truncate">
                                  {activeFile ? activeFile.name : 'active'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Telemetry metadata stats */}
                        <div className="w-48 bg-[#0F172A] border border-border-subtle rounded-[10px] p-3 flex flex-col justify-between shrink-0 font-mono text-[8px] leading-relaxed select-none shadow-md">
                          <div className="space-y-1.5">
                            <div className="text-[8px] text-text-muted uppercase tracking-widest font-black font-mono border-b border-border-subtle pb-1 flex items-center gap-1">
                              <span>🦀 Engine Specs (Rope)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Back-End Core:</span>
                              <span className="text-success font-bold">Rust (Rope SDK)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Rope Blocks:</span>
                              <span className="text-[#F8FAFC] font-semibold">{activeFile ? (activeFile.content.length * 1.05).toFixed(0) : '12,500'} b</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">AST Nodes:</span>
                              <span className="text-[#F8FAFC]">{activeFile ? (activeFile.content.split('\n').length * 2.2).toFixed(0) : '42'} items</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Parse Latency:</span>
                              <span className="text-success font-mono font-bold">0.12 ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">File Watchers:</span>
                              <span className="text-success font-bold">notify (active)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Thread Pool:</span>
                              <span className="text-accent-blue font-bold">8 threads</span>
                            </div>
                          </div>
                          
                          <div className="mt-1 text-[7px] text-text-muted leading-normal italic border-t border-border-subtle pt-1">
                            * Rope arrays handle heavy code operations instantly without ever block rendering.
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Terminal Resizable top Drag Handle */}
                  <div 
                    onMouseDown={startTerminalDrag}
                    className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-sky-500/40 bg-transparent active:bg-sky-400 transition-all duration-300"
                  />
                </div>
              )}

            </div>

            {/* COLUMN 3: RIGHT INTERACTIVE VIEWPORT PREVIEW PANEL */}
            {isPreviewOpen && (
              <div 
                style={{ width: `${previewWidth}px` }} 
                className="h-full shrink-0 flex flex-col bg-brand-main border-l border-border-subtle select-text relative overflow-hidden"
              >
                {previewPanel}
                
                {/* Resizable Width Drag handle on the left of Preview */}
                <div 
                  onMouseDown={startPreviewDrag}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#4F8CFF]/45 bg-transparent active:bg-accent-blue z-30 transition-all duration-300"
                />
              </div>
            )}

            {/* COLUMN 4: FAR-RIGHT AI COPILOT FLOATING DRAWER */}
            {isAiOpen && (
              <div 
                style={{ width: `${aiWidth}px` }} 
                className="h-full shrink-0 flex flex-col bg-brand-sidebar border-l border-border-subtle select-text relative overflow-hidden"
              >
                {aiPanel}

                {/* Resizable Width Drag handle on the left of AI Copilot */}
                <div 
                  onMouseDown={startAiDrag}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#4F8CFF]/45 bg-transparent active:bg-accent-blue z-30 transition-all duration-300"
                />
              </div>
            )}

          </div>
        </div>
      ) : (
        
        // ━━━━━━━━━━━━━━━━ MOBILE EXPERIENCE WORKSPACE PANELS DOCK ━━━━━━━━━━━━━━━━
        <div className="flex-1 min-h-0 flex flex-col bg-[#070708] select-text relative h-full">
          
          {/* Main Mobile Screen Area hosting active swipe tabs */}
          <div className="flex-1 min-h-0 overflow-y-auto text-left relative bg-[#070708] select-text">
            
            {/* Smooth transition container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full pb-1 flex flex-col"
              >
                
                {/* Tab Render explorer directory layout files */}
                {mobileTab === 'explorer' && (
                  <div className="flex-1 p-2 bg-[#09090b] overflow-y-auto no-scrollbar font-sans text-xs select-none">
                    
                    {/* Embedded custom Snapshots panel list triggers layout in mobile view */}
                    <div className="mb-4 bg-neutral-900/40 border border-neutral-850 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 text-neutral-400 uppercase font-black text-[9px] tracking-wider mb-1 font-mono">
                        <History className="w-3 h-3 text-sky-400" />
                        <span>Responsive Snapshot Presets</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {snapshots.map(s => (
                          <button
                            key={s.id}
                            onClick={() => handleApplySnapshot(s)}
                            className="shrink-0 px-2.5 py-1 bg-neutral-900 border border-neutral-805 hover:bg-neutral-800 text-[9px] text-neutral-300 hover:text-white rounded font-bold cursor-pointer transition-all"
                          >
                            📸 {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FileTree
                      templates={templates}
                      activeTemplate={activeTemplate}
                      activeFile={activeFile}
                      onSelectTemplate={onSelectTemplate}
                      onSelectFile={onSelectFile}
                      onCreateFile={onCreateFile}
                      onDeleteFile={onDeleteFile}
                      currentLang={currentLang}
                    />
                  </div>
                )}

                {/* Tab Render standard editor widget panel */}
                {mobileTab === 'editor' && (
                  <div className="flex-1 bg-[#070708] relative overflow-hidden flex flex-col select-text">
                    {editorPanel}
                  </div>
                )}

                {/* Tab Render high value AI Assistance panel */}
                {mobileTab === 'ai' && (
                  <div className="flex-1 bg-[#0d0d10] overflow-hidden flex flex-col">
                    {aiPanel}
                  </div>
                )}

                {/* Tab Render secure live preview panels */}
                {mobileTab === 'preview' && (
                  <div className="flex-1 bg-[#0b0b0d] overflow-hidden flex flex-col">
                    {previewPanel}
                  </div>
                )}

                {/* Tab Render Terminal Shell simulator */}
                {mobileTab === 'terminal' && (
                  <div className="flex-1 bg-[#09090b] flex flex-col text-left font-mono text-[10px] p-2 leading-relaxed h-full overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-2 px-1 select-none">
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase font-black font-mono">
                        <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
                        <span>Bash Command Console</span>
                      </div>
                      <div className="text-[8px] px-1.5 py-0.2 ml-2 bg-sky-950/20 text-sky-400 border border-sky-900/30 font-bold rounded">
                        Active Port: 3000
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto mb-2 space-y-1.5 font-mono text-[9px] px-1 pr-2 no-scrollbar">
                      {terminalLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-1">
                          <span className="text-neutral-600 shrink-0 font-bold text-[8px]">[Time]</span>
                          <div className={`whitespace-pre-wrap ${
                            log.type === 'system' ? 'text-neutral-400 font-extrabold pb-0.5' :
                            log.type === 'info' ? 'text-sky-400' :
                            log.type === 'output' ? 'text-neutral-400' :
                            log.type === 'input' ? 'text-neutral-200 font-bold' :
                            log.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {log.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1 bg-[#101013] border border-neutral-850 p-2 rounded-lg font-mono">
                      <span className="text-sky-400 font-bold font-mono">$</span>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-neutral-100 placeholder-neutral-650 text-[10px] font-mono leading-none"
                        placeholder="Type standard command (e.g., help, ls, cat index.html)..."
                      />
                    </form>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

          {/* Glowing bottom Floating quick action tools for mobile */}
          <div className="absolute right-4 bottom-16 select-none flex flex-col gap-1.5 z-40">
            <button
              onClick={runCompilePipeline}
              disabled={isCompiling}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 active:from-sky-300 text-black flex items-center justify-center shadow-lg cursor-pointer border border-sky-400"
              title="Compile workspace"
            >
              {isCompiling ? <Loader className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 fill-current text-black" />}
            </button>
          </div>

          {/* ━━━━━━━━━━━━━━━━ MOBILE SECURE DOCK NAVIGATION BAR ━━━━━━━━━━━━━━━━ */}
          <div className="h-14 bg-[#09090b] border-t border-[#141416] flex items-center justify-around px-2 py-1 shrink-0 select-none z-10 font-mono">
            
            {/* Mobile Tab Explorer */}
            <button
              onClick={() => {
                setMobileTab('explorer');
                setGlobalStatus('Opened file explorer drawer on mobile.');
              }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 cursor-pointer transition-all ${
                mobileTab === 'explorer' ? 'text-sky-400 font-black' : 'text-neutral-500'
              }`}
            >
              <Folder className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-widest uppercase">Files</span>
            </button>

            {/* Mobile Tab Code Editor */}
            <button
              onClick={() => {
                setMobileTab('editor');
                setGlobalStatus('Navigated to main sandbox code editor.');
              }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 cursor-pointer transition-all ${
                mobileTab === 'editor' ? 'text-sky-400 font-black' : 'text-neutral-500'
              }`}
            >
              <Code className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-widest uppercase">Editor</span>
            </button>

            {/* Mobile Tab AI Bot */}
            <button
              onClick={() => {
                setMobileTab('ai');
                setGlobalStatus('Interacted with mobile AI copilot.');
              }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 cursor-pointer transition-all relative ${
                mobileTab === 'ai' ? 'text-sky-400 font-black' : 'text-neutral-500'
              }`}
            >
              <Bot className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-widest uppercase">AI Bot</span>
            </button>

            {/* Mobile Tab Live Preview viewport */}
            <button
              onClick={() => {
                setMobileTab('preview');
                setGlobalStatus('Reviewing live secure view execution on mobile.');
              }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 cursor-pointer transition-all ${
                mobileTab === 'preview' ? 'text-sky-400 font-black' : 'text-neutral-500'
              }`}
            >
              <Eye className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-widest uppercase">Preview</span>
            </button>

            {/* Mobile Tab Terminal details */}
            <button
              onClick={() => {
                setMobileTab('terminal');
                setGlobalStatus('Active shell system console logs on mobile.');
              }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 cursor-pointer transition-all relative ${
                mobileTab === 'terminal' ? 'text-sky-400 font-black' : 'text-neutral-500'
              }`}
            >
              <TerminalIcon className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-widest uppercase">Console</span>
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            </button>

          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━ DESKTOP FOOTER TELEMETRY STATUS BAR ━━━━━━━━━━━━━━━━ */}
      <footer className={`border-t border-[#141416]/50 bg-[#09090b] flex items-center justify-between px-3 md:px-4 text-[10px] text-neutral-500 select-none font-mono shrink-0 transition-all duration-300 ${
        isZenMode 
          ? 'opacity-0 hover:opacity-100 absolute bottom-0 left-0 right-0 h-8 hover:bg-[#08080a]/95 duration-200 z-40 bg-neutral-950/95 shadow-2xl border-t border-neutral-800' 
          : 'relative h-8'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[8px] text-neutral-600 hidden md:inline">STATUS:</span>
          <span className="text-neutral-400 font-medium truncate max-w-[280px] sm:max-w-[400px]">
            {systemAlert || globalStatus || 'Workspace synced with local dev templates'}
          </span>
        </div>

        {/* Responsive viewport scaling indicators and controls */}
        <div className="flex items-center gap-3 text-[9px] text-[#4d4d53] shrink-0 font-mono">
          
          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400">
            <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-500">Scale:</span>
            <div className="flex items-center bg-[#101014] border border-neutral-800 rounded px-1 py-0.5 gap-1 select-none">
              {(['auto', '100', '85', '75', '65', '50'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setZoomLevel(lvl);
                    setGlobalStatus(`Scaled workspace zoom to ${lvl === 'auto' ? 'Auto-Fit' : lvl + '%'}`);
                  }}
                  className={`px-1.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                    zoomLevel === lvl
                      ? 'bg-sky-500 text-black shadow-sm font-black'
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-850'
                  }`}
                  title={lvl === 'auto' ? 'Auto Zoom fit to viewport shape' : `Zoom ${lvl}%`}
                >
                  {lvl === 'auto' ? 'AUTO' : `${lvl}%`}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono text-[8px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 rounded text-neutral-400 shrink-0">
            Multiplier: <span className="text-sky-400 font-bold">{(scaleFactor * 100).toFixed(0)}%</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-neutral-800/60 font-mono text-[8px] text-emerald-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Workspace Synced</span>
          </div>
        </div>
      </footer>

      {/* ━━━━━━━━━━━━━━━━ COMMAND PALETTE OVERLAY (⌘K / Ctrl+K) ━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {isPaletteOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none selection:bg-sky-500/20 font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-[#0c0c0f] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Command text box input */}
              <div className="flex items-center gap-3 px-3.5 py-3 border-b border-neutral-850 bg-[#09090b]">
                <Search className="w-4 w-4 text-sky-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ask and execute anything... Search sandbox file directories or select command presets"
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-neutral-200 placeholder-neutral-550 mr-4"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1 rounded bg-[#101014] hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Palette scrollable commands list */}
              <div className="max-h-[290px] overflow-y-auto no-scrollbar p-2 font-sans">
                
                {/* Simulated file search matches */}
                {paletteSearch.trim().length > 0 && (
                  <div className="mb-2">
                    <div className="px-2.5 py-1 text-[9px] font-bold text-sky-400 uppercase tracking-widest font-mono">File sandbox matches</div>
                    <div className="space-y-0.5">
                      {activeTemplate.files
                        .filter(f => f.name.toLowerCase().includes(paletteSearch.toLowerCase()) || f.path.toLowerCase().includes(paletteSearch.toLowerCase()))
                        .map(file => (
                          <button
                            key={file.id}
                            onClick={() => handlePaletteSelectFile(file.id)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-500/10 hover:text-sky-300 border border-transparent hover:border-sky-500/10 text-neutral-300 text-xs flex items-center justify-between cursor-pointer transition-all font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{file.path}</span>
                            </div>
                            <span className="text-[9px] text-neutral-600 font-sans font-bold">Select File</span>
                          </button>
                        ))
                      }
                      {activeTemplate.files.filter(f => f.name.toLowerCase().includes(paletteSearch.toLowerCase()) || f.path.toLowerCase().includes(paletteSearch.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-xs italic text-neutral-500 font-sans">No sandbox files match search query.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Common Presets actions list */}
                <div className="mb-2">
                  <div className="px-2.5 py-1 text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Virtual environment commands</div>
                  <div className="space-y-0.5 font-sans">
                    
                    {/* Command: run TypeScript compile */}
                    <button
                      onClick={() => {
                        setIsPaletteOpen(false);
                        runCompilePipeline();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                        <span>npm run build / Run TypeScript Compile checks</span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">BUILD</span>
                    </button>

                    {/* Command: Toggle files panel */}
                    <button
                      onClick={() => {
                        setIsSidebarOpen(prev => !prev);
                        setIsPaletteOpen(false);
                        setGlobalStatus(isSidebarOpen ? 'Collapsed files sidebar' : 'Opened files tree');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-sky-400" />
                        <span>Toggle File Explorer Sidebar Panel</span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">ALT+S</span>
                    </button>

                    {/* Command: Toggle interactive preview */}
                    <button
                      onClick={() => {
                        setIsPreviewOpen(prev => !prev);
                        setIsPaletteOpen(false);
                        setGlobalStatus(isPreviewOpen ? 'Collapsed interactive viewport' : 'Opened viewport window');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Toggle Secure Sandbox Live Preview viewport</span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">ALT+P</span>
                    </button>

                    {/* Command: Toggle copilot */}
                    <button
                      onClick={() => {
                        setIsAiOpen(prev => !prev);
                        setIsPaletteOpen(false);
                        setGlobalStatus(isAiOpen ? 'Hidden AI drawer' : 'Visible AI drawer');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-sky-400" />
                        <span>Toggle AI Copilot Companion panel</span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">ALT+A</span>
                    </button>

                    {/* Command: Open snapshot drawer */}
                    <button
                      onClick={() => {
                        setActiveTab('snapshots');
                        setIsSidebarOpen(true);
                        setIsPaletteOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-sky-450 text-sky-400" />
                        <span>Save / Restore custom Workspace snapshot state points</span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">SNAPSHOT</span>
                    </button>

                  </div>
                </div>

              </div>

              {/* Keyboard bindings overview footer */}
              <div className="border-t border-neutral-850 bg-[#08080a] p-3 text-left font-sans text-[10px] text-neutral-500 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5">
                  <span className="bg-neutral-905 px-1.5 py-0.5 border border-neutral-800 rounded font-mono font-thin text-[8px] text-neutral-400">Esc</span>
                  <span>Exit panel</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-600 font-mono text-[8.5px]">
                  <span>⚡ Powered by Antigravity Codex Engines</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
