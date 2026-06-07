/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  Plus, 
  Trash2, 
  Play, 
  ChevronRight, 
  FolderOpen, 
  Sparkles,
  GitBranch,
  Settings,
  Users
} from 'lucide-react';
import { CodeFile } from '../types';
import { ProjectTemplate } from './ProjectTemplates';
import { translations } from '../translations';

interface FileTreeProps {
  templates: ProjectTemplate[];
  activeTemplate: ProjectTemplate;
  activeFile: CodeFile | null;
  onSelectTemplate: (templateId: string) => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: string) => void;
  onDeleteFile: (fileId: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

export default function FileTree({
  templates,
  activeTemplate,
  activeFile,
  onSelectTemplate,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  currentLang
}: FileTreeProps) {
  const [newFileName, setNewFileName] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // determine language from extension
    let lang = selectedLanguage;
    if (newFileName.endsWith('.html')) lang = 'html';
    else if (newFileName.endsWith('.css')) lang = 'css';
    else if (newFileName.endsWith('.json')) lang = 'json';
    else if (newFileName.endsWith('.js')) lang = 'javascript';
    else if (newFileName.endsWith('.ts')) lang = 'typescript';

    onCreateFile(newFileName, lang);
    setNewFileName('');
    setIsAddingFile(false);
  };

  return (
    <div id="file-tree-container" className="flex flex-col h-full bg-brand-sidebar border-r border-border-subtle text-text-secondary w-full select-none">
      {/* Platform Title */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border-subtle">
        <div id="codex-logo-box" className="p-1.5 bg-accent-blue/10 text-accent-blue rounded-[10px] border border-accent-blue/25 shadow-[0_0_12px_rgba(79,140,255,0.12)]">
          <Sparkles className="w-4 h-4 text-accent-blue shrink-0 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xs font-extrabold text-text-primary tracking-widest uppercase font-sans">Codex</h1>
          <p className="text-[9px] text-text-muted font-medium">{translations[currentLang].fileTree.platformSubtitle}</p>
        </div>
      </div>

      {/* Project Template Switcher */}
      <div className="p-4 border-b border-border-subtle space-y-2">
        <label className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest block font-sans">
          {translations[currentLang].fileTree.sandboxTemplate}
        </label>
        <div className="relative">
          <select
            value={activeTemplate.id}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="w-full bg-brand-secondary border border-border-subtle rounded-[10px] px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue transition-all cursor-pointer appearance-none shadow-sm"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-secondary text-[8px]">
            ▼
          </div>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed font-sans">
          {activeTemplate.description}
        </p>
      </div>

      {/* Directory Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-text-muted font-bold uppercase tracking-wider font-mono">
          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>src / workspace /</span>
        </div>

        {/* File items */}
        <div className="space-y-1 pl-1">
          {activeTemplate.files.map((file) => {
            const isActive = activeFile?.id === file.id;
            return (
              <div
                key={file.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-[10px] cursor-pointer text-xs transition-all border ${
                  isActive
                    ? 'bg-accent-blue/8 border-accent-blue/15 text-text-primary font-semibold ring-1 ring-accent-blue/10 shadow-[0_2px_10px_rgba(79,140,255,0.08)]'
                    : 'border-transparent text-text-secondary hover:bg-[#131C31]/50 hover:text-text-primary'
                }`}
                onClick={() => onSelectFile(file.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-accent-blue' : 'text-text-muted'}`} />
                  <span className="truncate font-sans">{file.name}</span>
                </div>
                
                {/* Delete file button (keep index.html safe) */}
                {file.name !== 'index.html' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-error rounded-[6px] transition-all cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3 text-text-muted hover:text-error" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Adding inline input form */}
        {isAddingFile ? (
          <form onSubmit={handleCreateFile} className="mt-2 p-2.5 bg-brand-secondary border border-border-subtle rounded-[10px] space-y-2">
            <input
              type="text"
              autoFocus
              placeholder={translations[currentLang].fileTree.filenamePlaceholder}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-brand-main border border-border-subtle rounded-[8px] px-2.5 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-all"
            />
            <div className="flex items-center justify-between pt-1">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-brand-main border border-border-subtle rounded-[8px] text-[9px] text-text-secondary px-2 py-1 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
              </select>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddingFile(false)}
                  className="px-2 py-1 text-[9px] text-text-muted hover:text-text-primary hover:bg-brand-card rounded-[8px] transition-colors cursor-pointer"
                >
                  {translations[currentLang].fileTree.cancel}
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-[9px] bg-accent-blue text-text-primary hover:bg-accent-hover rounded-[8px] font-bold transition-all shadow-[0_2px_8px_rgba(79,140,255,0.2)] cursor-pointer"
                >
                  {translations[currentLang].fileTree.create}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingFile(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-text-muted hover:text-accent-blue hover:bg-accent-blue/5 rounded-[10px] border border-dashed border-border-subtle mt-3 hover:border-accent-blue/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-sans font-medium">{translations[currentLang].fileTree.addFile}</span>
          </button>
        )}
      </div>

      {/* System Status Indicators / Platform Info */}
      <div className="p-4 border-t border-border-subtle text-text-muted font-sans space-y-2.5 select-none bg-brand-secondary/40">
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping"></span>
            <span className="text-text-secondary font-medium">{translations[currentLang].fileTree.virtualSandbox}</span>
          </span>
          <span className="bg-brand-card border border-border-subtle px-1.5 py-0.5 text-text-secondary rounded-[6px] font-mono text-[9px]">Port 3000</span>
        </div>
        <div className="text-[10px] space-y-1.5 text-text-muted mt-2 font-sans select-none">
          <div className="flex justify-between">
            <span>{translations[currentLang].fileTree.runtimeEngine}</span>
            <span className="text-text-secondary font-medium">NodeJS / Vite</span>
          </div>
          <div className="flex justify-between">
            <span>{translations[currentLang].fileTree.llmForecast}</span>
            <span className="text-text-secondary font-medium">Gemini 3.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
