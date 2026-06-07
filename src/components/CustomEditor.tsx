/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  FileCode, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Zap, 
  Loader, 
  Play, 
  AlertTriangle, 
  Info, 
  Bug,
  ListRestart
} from 'lucide-react';
import { CodeFile } from '../types';
import { translations } from '../translations';
import { 
  Eye, 
  EyeOff, 
  GitMerge, 
  Layers, 
  ChevronDown, 
  CornerDownRight, 
  FileSymlink, 
  Lock, 
  CheckCircle2, 
  Flame, 
  FileText
} from 'lucide-react';

interface CustomEditorProps {
  activeFile: CodeFile | null;
  allFiles?: CodeFile[];
  onSelectFile?: (fileId: string) => void;
  onFileContentChange: (newContent: string) => void;
  onSetGlobalStatus: (msg: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

interface Issue {
  severity: 'info' | 'warning' | 'error';
  line: number | null;
  title: string;
  message: string;
  fix?: string;
}

interface AnalysisReport {
  summary: string;
  status: 'clean' | 'warning' | 'error';
  issues: Issue[];
}

export default function CustomEditor({ 
  activeFile, 
  allFiles = [],
  onSelectFile,
  onFileContentChange,
  onSetGlobalStatus,
  currentLang
}: CustomEditorProps) {
  const [editorVal, setEditorVal] = useState('');
  const [cursorOffset, setCursorOffset] = useState(0);
  const [ghostText, setGhostText] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(() => {
    try {
      return localStorage.getItem('codex_autocomplete_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Unique Premium Additions:
  // 1. Curated Monochrome high-contrast theme
  const [isMonochrome, setIsMonochrome] = useState(() => {
    try {
      return localStorage.getItem('codex_is_monochrome') === 'true';
    } catch {
      return false;
    }
  });

  // 2. Inline Multi-File Peeking states
  const [peekFileId, setPeekFileId] = useState<string | null>(null);
  const [peekFileContent, setPeekFileContent] = useState('');
  const [isPeekSaving, setIsPeekSaving] = useState(false);
  const [showPeekDropdown, setShowPeekDropdown] = useState(false);
  
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  // Sync autocomplete preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codex_autocomplete_enabled', String(autocompleteEnabled));
    } catch (e) {
      // Ignore storage errors
    }
  }, [autocompleteEnabled]);

  // Sync monochrome to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codex_is_monochrome', String(isMonochrome));
    } catch (e) {}
  }, [isMonochrome]);

  // Handle Loading/switching main active file
  useEffect(() => {
    if (activeFile) {
      setEditorVal(activeFile.content);
      setGhostText('');
    }
  }, [activeFile]);

  // Load peeked file content when selection changes
  useEffect(() => {
    if (peekFileId && allFiles) {
      const peeked = allFiles.find(f => f.id === peekFileId);
      if (peeked) {
        setPeekFileContent(peeked.content);
      }
    } else {
      setPeekFileContent('');
    }
  }, [peekFileId, allFiles]);

  // Handle predicting debounces
  useEffect(() => {
    if (!autocompleteEnabled || !editorVal.trim() || !activeFile) {
      setGhostText('');
      return;
    }

    const timer = setTimeout(() => {
      fetchCodeSuggestion();
    }, 900); // 900ms silence predicts future code

    return () => clearTimeout(timer);
  }, [editorVal, autocompleteEnabled]);

  const fetchCodeSuggestion = async () => {
    if (!activeFile) return;
    setIsPredicting(true);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editorVal,
          filename: activeFile.name,
          cursorOffset: cursorOffset || editorVal.length,
          language: activeFile.language,
        }),
      });

      const data = await response.json();
      if (data.success && data.suggestion) {
        // Strip trailing/leading extra carriage returns to keep inline preview correct
        setGhostText(data.suggestion);
      } else {
        setGhostText('');
      }
    } catch (err) {
      console.error('[Autocompleter Error]:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const start = e.target.selectionStart;
    
    setCursorOffset(start);
    setEditorVal(newVal);
    onFileContentChange(newVal);
  };

  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorOffset(target.selectionStart);
    // Erase ghost text temporarily if cursor moves manually
    setGhostText('');
  };

  // Intecept TAB to inject predictive ghost code instantly!
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      acceptGhostPrediction();
    }
  };

  const acceptGhostPrediction = () => {
    if (!ghostText) return;

    const prefix = editorVal.slice(0, cursorOffset);
    const suffix = editorVal.slice(cursorOffset);
    const insertedCode = prefix + ghostText + suffix;

    setEditorVal(insertedCode);
    onFileContentChange(insertedCode);
    
    // Move cursor straight to end of inserted segment
    const newOffset = cursorOffset + ghostText.length;
    setCursorOffset(newOffset);
    setGhostText('');
    onSetGlobalStatus('Successfully accepted predictive code autocomplete forecast!');

    // Restore focus to textarea after rendering update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = newOffset;
        textareaRef.current.selectionEnd = newOffset;
      }
    }, 50);
  };

  // Run deep analysis reports
  const triggerCodeAnalysis = async () => {
    if (!activeFile) return;
    setIsAnalyzing(true);
    onSetGlobalStatus('Deep scanning files for syntax structure warnings...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editorVal,
          filename: activeFile.name,
          language: activeFile.language,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisReport(data.analysis);
        onSetGlobalStatus(`Diagnostic scan completed. Found ${data.analysis.issues?.length || 0} optimization vectors.`);
      } else {
        throw new Error(data.error || 'Diagnostic service error');
      }
    } catch (e: any) {
      console.error(e);
      onSetGlobalStatus(`Scan failed: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger compiler precise fixer
  const triggerAutoFix = async (issueMsg: string) => {
    if (!activeFile) return;
    setIsFixing(true);
    onSetGlobalStatus('Leveraging auto-fix algorithm on code segments...');

    try {
      const response = await fetch('/api/fix-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editorVal,
          issue: issueMsg,
          filename: activeFile.name,
          language: activeFile.language,
        }),
      });

      const data = await response.json();
      if (data.success && data.correctedCode) {
        setEditorVal(data.correctedCode);
        onFileContentChange(data.correctedCode);
        setAnalysisReport(null); // Clear issues
        onSetGlobalStatus('Magic corrective patch compiled cleanly!');
      } else {
        throw new Error(data.error || 'Compiler correction failure');
      }
    } catch (e: any) {
      console.error(e);
      onSetGlobalStatus(`Correction aborted: ${e.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  if (!activeFile) {
    return (
      <div id="no-active-workspace" className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-main text-text-secondary font-sans">
        <div className="p-4 bg-brand-secondary border border-border-subtle rounded-[10px] shadow-lg mb-4">
          <FileCode className="w-10 h-10 text-accent-blue animate-pulse" />
        </div>
        <h3 className="text-sm font-extrabold text-text-primary tracking-wide">{translations[currentLang].customEditor.emptyTitle}</h3>
        <p className="text-xs text-text-muted mt-1.5 max-w-xs text-center leading-normal select-none">
          {translations[currentLang].customEditor.emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div id="codex-editor-main" className={`flex-1 flex flex-col h-full ${isMonochrome ? 'bg-[#080B15]' : 'bg-brand-main'} text-text-primary font-sans border-r border-[#1E293B]`}>
      
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-brand-main select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-accent-blue" />
          <span className="text-xs font-semibold text-text-primary leading-none">{activeFile.name}</span>
          <span className="text-[9px] bg-brand-secondary border border-border-subtle text-text-muted rounded-[6px] px-2 py-0.5 uppercase tracking-wider font-mono font-bold">
            {activeFile.language}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Zen Monochrome Theme Switcher */}
          <button
            onClick={() => {
              setIsMonochrome(p => !p);
              onSetGlobalStatus(`Switched theme to ${!isMonochrome ? 'Zen Monochrome' : 'Rich Syntax Accents'}`);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-[8px] border transition-all cursor-pointer ${
              isMonochrome
                ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_10px_rgba(79,140,255,0.08)]'
                : 'bg-brand-secondary border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-blue/30'
            }`}
            title="Toggle Zen Monochrome Minimal Theme (uses colors strictly for deep AI inputs and insertion anchors)"
          >
            {isMonochrome ? <EyeOff className="w-3 h-3 text-accent-blue" /> : <Eye className="w-3 h-3 text-accent-blue" />}
            <span className="hidden sm:inline">{isMonochrome ? 'Zen Mode (On)' : 'Zen Mode (Off)'}</span>
          </button>

          {/* Inline Multi-File Peeking dropdown selector */}
          <div className="relative">
            <button
               onClick={() => setShowPeekDropdown(p => !p)}
               className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-brand-secondary border border-border-subtle hover:border-accent-blue/30 text-text-secondary hover:text-[#FFFFFF] hover:bg-brand-card font-bold rounded-[8px] transition-all cursor-pointer"
               title="Inline Multi-File Peeking client-side pipeline"
            >
              <Layers className="w-3 h-3 text-accent-blue" />
              <span className="hidden md:inline">Inline Peek</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showPeekDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-brand-card border border-border-subtle rounded-[10px] shadow-2xl p-1.5 z-30 select-none animate-fade-in font-sans text-left ring-1 ring-black/40">
                <div className="px-2 py-1 text-[8px] font-extrabold text-text-muted uppercase tracking-widest border-b border-border-subtle">
                  Select Context Node
                </div>
                <div className="max-h-48 overflow-y-auto pt-1">
                  {allFiles.filter(f => f.id !== activeFile?.id).length === 0 ? (
                    <div className="px-2 py-1.5 text-[10px] text-text-muted italic">No secondary files</div>
                  ) : (
                    allFiles.filter(f => f.id !== activeFile?.id).map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setPeekFileId(f.id);
                          setShowPeekDropdown(false);
                          onSetGlobalStatus(`Expanded inline peeking nested container at "${f.name}".`);
                        }}
                        className={`w-full text-left px-2 py-2 text-[10px] rounded-[6px] hover:bg-brand-secondary transition-colors cursor-pointer flex items-center justify-between ${
                          peekFileId === f.id ? 'text-accent-blue font-extrabold bg-accent-blue/10 border border-accent-blue/10' : 'text-text-secondary'
                        }`}
                      >
                        <span className="truncate">{f.name}</span>
                        <span className="text-[7px] font-mono bg-[#0B1020] border border-border-subtle px-1 text-text-muted uppercase rounded-[4px]">{f.language}</span>
                      </button>
                    ))
                  )}
                  {peekFileId && (
                    <button
                      onClick={() => {
                        setPeekFileId(null);
                        setShowPeekDropdown(false);
                        onSetGlobalStatus('Closed inline peeking editors.');
                      }}
                      className="w-full text-left px-2 py-1.5 text-[9px] text-error hover:bg-brand-secondary transition-colors cursor-pointer border-t border-border-subtle mt-1.5 font-bold italic"
                    >
                      Remove active peek
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Autocomplete Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-text-secondary hover:text-text-primary border border-border-subtle bg-brand-secondary hover:bg-brand-card px-2.5 py-1.5 rounded-[8px] select-none transition-all">
            <input
              type="checkbox"
              checked={autocompleteEnabled}
              onChange={(e) => setAutocompleteEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded border border-[#1E293B] bg-brand-main text-accent-blue focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="font-semibold tracking-wide">{translations[currentLang].customEditor.aiAutocomplete}</span>
          </label>

          {/* Analyze Actions */}
          <button
            onClick={triggerCodeAnalysis}
            disabled={isAnalyzing || isFixing}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] bg-accent-blue/8 hover:bg-accent-blue/15 text-accent-blue border border-accent-blue/15 hover:border-accent-blue/25 font-bold rounded-[8px] transition-colors cursor-pointer shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-3 h-3 animate-spin text-accent-blue" />
                <span>{translations[currentLang].customEditor.scanning}</span>
              </>
            ) : (
              <>
                <Bug className="w-3 h-3 text-accent-blue" />
                <span>{translations[currentLang].customEditor.deepScan}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Client Body */}
      <div className="flex-1 relative flex overflow-hidden min-h-0">
        
        {/* Custom predictive ghost overlays container */}
        <div className="flex-1 h-full relative font-mono text-xs flex">
          
          {/* Visual line numbering margin layout */}
          <div className="w-12 bg-brand-main/80 border-r border-border-subtle flex flex-col items-end pr-3.5 pt-3 text-[10px] text-text-muted line-none select-none text-right shrink-0">
            {Array.from({ length: Math.max(editorVal.split('\n').length, 25) }).map((_, i) => (
              <div key={i} className="h-[18px] select-none font-mono text-text-muted/65 font-medium">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Interactive Core Area */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            
            {/* Top Editor Split */}
            <div className={`relative ${peekFileId ? 'h-[50%] border-b border-border-subtle' : 'h-full'} transition-all duration-300`}>
              <textarea
                ref={textareaRef}
                value={editorVal}
                onChange={handleTextareaChange}
                onSelect={handleCursorMove}
                onKeyUp={handleCursorMove}
                onKeyDown={handleKeyDown}
                className={`absolute inset-0 w-full h-full bg-transparent px-4 py-3 font-mono text-xs leading-[18px] focus:outline-none resize-none overflow-y-auto whitespace-pre tab-4 select-all ${
                  isMonochrome 
                    ? 'text-[#F1F5F9] selection:bg-accent-blue/12 placeholder-[#475569]' 
                    : 'text-text-primary selection:bg-accent-blue/20 placeholder-[#64748B]'
                }`}
                placeholder="// Write modern code sandbox integrations here..."
                spellCheck={false}
              />

              {/* Float Autocomplete Ghost UI Overlay Widget right above cursor */}
              {ghostText && (
                <div className="absolute bottom-4 right-4 bg-brand-card border border-border-subtle rounded-[10px] shadow-2xl p-3.5 z-10 max-w-sm text-left flex items-start gap-3 animate-fade-in ring-1 ring-black/30">
                  <Sparkles className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="space-y-2 font-sans">
                    <div className="text-[10px] text-text-muted font-extrabold uppercase tracking-widest">
                      {translations[currentLang].customEditor.predictedHeader}
                    </div>
                    <pre className="text-[10px] font-mono leading-relaxed text-accent-blue p-2 bg-[#0B1020] rounded-[8px] border border-border-subtle overflow-x-auto max-h-24">
                      {ghostText.slice(0, 100)}
                    </pre>
                    <p className="text-[10px] text-text-muted">
                      {translations[currentLang].customEditor.predictedHint.includes('Tab') ? (
                        <>
                          Press <kbd className="px-1.5 py-0.5 rounded bg-brand-main text-[#FFFFFF] border border-[#1E293B] font-mono font-black text-[9px] shadow-sm">Tab</kbd> {translations[currentLang].customEditor.predictedHint.split('Tab')[1] || 'or click button below.'}
                        </>
                      ) : (
                        translations[currentLang].customEditor.predictedHint
                      )}
                    </p>
                    <button
                      onClick={acceptGhostPrediction}
                      className="mt-1 px-3 py-1.5 bg-accent-blue hover:bg-accent-hover text-[#FFFFFF] text-[10px] rounded-[8px] font-bold cursor-pointer transition-all shadow-md shadow-accent-blue/15"
                    >
                      {translations[currentLang].customEditor.predictedAccept}
                    </button>
                  </div>
                </div>
              )}

              {/* IsPredicting overlay notifier */}
              {isPredicting && (
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-brand-card/90 border border-border-subtle rounded-[6px] text-[9px] text-[#94A3B8]">
                  <Loader className="w-2.5 h-2.5 text-accent-blue animate-spin" />
                  <span>{translations[currentLang].customEditor.forecastIntent}</span>
                </div>
              )}
            </div>

            {/* Bottom Multi-File Inline Peek Split */}
            {peekFileId && (() => {
              const peekedFile = allFiles.find(f => f.id === peekFileId);
              if (!peekedFile) return null;

              return (
                <div className="h-[50%] bg-[#0E1626] flex flex-col relative select-text overflow-hidden animate-fade-in border-t border-border-subtle">
                  
                  {/* Connective Dependency circuit line header */}
                  <div className="h-8 px-4 bg-brand-main border-b border-border-subtle flex items-center justify-between text-[10px] font-mono text-text-muted select-none">
                    <div className="flex items-center gap-2 truncate">
                      <CornerDownRight className="w-3.5 h-3.5 text-success animate-pulse shrink-0" />
                      <span className="font-bold text-text-muted uppercase tracking-widest text-[8px]">CONNECTIVE SPECS GRAPH PATHWAY:</span>
                      <span className="text-success font-medium truncate max-w-[250px] sm:max-w-none font-sans text-[11px]">
                        {activeFile.name} &rarr; <span className="underline decoration-success/50 font-bold">{peekedFile.name}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-sans">
                      <button
                        onClick={() => {
                          setIsPeekSaving(true);
                          onSetGlobalStatus(`Saving nested buffer edits to AST database...`);
                          setTimeout(() => {
                            // Write updated simulation
                            peekedFile.content = peekFileContent;
                            onSetGlobalStatus(`Committed and refreshed AST context: "${peekedFile.name}" updated!`);
                            setIsPeekSaving(false);
                          }, 750);
                        }}
                        className="px-2.5 py-1 bg-success text-brand-main hover:bg-[#16a34a] border-none font-extrabold text-[#FFFFFF] rounded-[6px] transition-all text-[9px]"
                      >
                        {isPeekSaving ? 'COMMITING AST...' : 'COMMIT CHANGES'}
                      </button>

                      {onSelectFile && (
                        <button
                          onClick={() => {
                            onSelectFile(peekedFile.id);
                            setPeekFileId(null);
                            onSetGlobalStatus(`Promoted peeked file "${peekedFile.name}" to primary viewport.`);
                          }}
                          className="px-2.5 py-1 bg-accent-blue/15 hover:bg-accent-blue/25 text-accent-blue border border-accent-blue/20 rounded-[6px] font-bold transition-all text-[9px]"
                        >
                          PROPAGATE TO MAIN
                        </button>
                      )}

                      <button
                        onClick={() => setPeekFileId(null)}
                        className="text-text-secondary hover:text-text-primary text-[10px] font-bold"
                        title="Dismiss inline peek component"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Inline Peek Editor Editor */}
                  <div className="flex-1 relative flex overflow-hidden min-h-0">
                    
                    {/* Line numbering sidebar for the Peek editor */}
                    <div className="w-12 bg-brand-main border-r border-border-subtle flex flex-col items-end pr-3.5 pt-3 text-[9px] text-[#475569] select-none text-right font-mono shrink-0">
                      {Array.from({ length: Math.max(peekFileContent.split('\n').length, 12) }).map((_, i) => (
                        <div key={i} className="h-4 select-none font-mono text-[#475569]/80">
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Interactive Peek textarea */}
                    <div className="flex-1 relative h-full">
                      <textarea
                        value={peekFileContent}
                        onChange={(e) => setPeekFileContent(e.target.value)}
                        className="absolute inset-0 w-full h-full bg-transparent px-4 py-3 text-[#E2E8F0] font-mono text-xs leading-4 focus:outline-none resize-none overflow-y-auto whitespace-pre tab-4 select-all selection:bg-accent-blue/15"
                        placeholder="// Edit peeked dependency inline..."
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* Dynamic Scan Diagnostic Issue Inspector */}
        {analysisReport && (
          <div className="w-72 border-l border-border-subtle bg-[#0D1527] flex flex-col h-full overflow-y-auto select-none p-3.5 space-y-3.5 font-sans">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest text-left">
                {translations[currentLang].customEditor.scanTitle}
              </span>
              <button
                onClick={() => setAnalysisReport(null)}
                className="text-[9px] py-1 px-2 border border-border-subtle rounded-[6px] bg-[#0B1020] text-text-secondary hover:text-text-primary hover:border-accent-blue/40"
              >
                {translations[currentLang].customEditor.hide}
              </button>
            </div>

            {/* Header summary info */}
            <div className={`p-3 rounded-[10px] border ${
              analysisReport.status === 'error' ? 'bg-[#EF4444]/15 border-error/20 text-error' :
              analysisReport.status === 'warning' ? 'bg-[#F59E0B]/15 border-warning/20 text-warning' :
              'bg-success/15 border-success/20 text-success'
            } text-xs text-left leading-normal`}>
              <div className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[10px]">
                {analysisReport.status === 'error' && <Bug className="w-3.5 h-3.5" />}
                {analysisReport.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                {analysisReport.status === 'clean' && <Check className="w-3.5 h-3.5" />}
                <span>Diagnostic: {analysisReport.status.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-text-primary/95">{analysisReport.summary}</p>
            </div>

            {/* Core Issues Iterations */}
            <div className="space-y-3 overflow-y-auto pr-0.5">
              {analysisReport.issues && analysisReport.issues.length > 0 ? (
                analysisReport.issues.map((issue, idx) => {
                  if (!issue) return null;
                  return (
                    <div key={idx} className="bg-brand-secondary rounded-[10px] p-3 border border-border-subtle text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider ${
                          issue.severity === 'error' ? 'bg-[#EF4444]/15 text-error border border-error/20' :
                          issue.severity === 'warning' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-warning/20' :
                          'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                        }`}>
                          Line {issue.line || 'All'} • {issue.severity || 'info'}
                        </span>
                      </div>
                      <div className="font-extrabold text-[11px] text-[#F8FAFC]">{issue.title || 'Code Insight'}</div>
                      <p className="text-[10px] text-text-secondary leading-normal">{issue.message}</p>
                      
                      {/* Render magical patch corrector button */}
                      <button
                        onClick={() => triggerAutoFix(issue.message || '')}
                        disabled={isFixing}
                        className="w-full flex items-center justify-center gap-1.5 bg-accent-blue hover:bg-accent-hover text-[#FFFFFF] border-none py-2 px-2.5 rounded-[8px] text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer shadow-sm shadow-accent-blue/10"
                      >
                      {isFixing ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          <span>{translations[currentLang].customEditor.correcting}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse text-white" />
                          <span>{translations[currentLang].customEditor.correctBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
              ) : (
                <div className="text-center py-6 text-text-muted text-xs">
                  <Check className="w-8 h-8 text-success/40 mx-auto mb-2 animate-bounce" />
                  {translations[currentLang].customEditor.noIssues}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
