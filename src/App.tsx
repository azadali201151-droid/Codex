/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  GitBranch, 
  Server, 
  Terminal, 
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
  Github
} from 'lucide-react';
import FileTree from './components/FileTree';
import CustomEditor from './components/CustomEditor';
import LivePreview from './components/LivePreview';
import AICopilot from './components/AICopilot';
import GithubIntegration from './components/GithubIntegration';
import DeploymentPipeline from './components/DeploymentPipeline';
import { PROJECT_TEMPLATES, ProjectTemplate } from './components/ProjectTemplates';
import { CodeFile, Collaborator } from './types';
import CursorLandingPage from './components/CursorLandingPage';
import { translations } from './translations';
import WorkspaceOS from './components/WorkspaceOS';

export default function App() {
  const [currentLang, setCurrentLang] = useState<'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'landing' | 'ide'>('landing');
  const [templates, setTemplates] = useState<ProjectTemplate[]>(PROJECT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<ProjectTemplate>(PROJECT_TEMPLATES[0]);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(PROJECT_TEMPLATES[0]?.files[0] || null);
  
  // Left Sidebar Ribbon Tab: 'explorer' | 'github' | 'devops' | 'ai-copilot'
  const [activeSidebarTab, setActiveSidebarTab] = useState<'explorer' | 'github' | 'devops'>('explorer');
  // Whether the sidebar drawer is expanded or collapsed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // On mobile/tablet widths, what should be primarily shown: 'editor' | 'preview' | 'ai' | 'files'
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'preview' | 'ai' | 'files'>('editor');
  // Right side AI Copilot visibility toggle (keep always available as sidebar drawer/dock)
  const [isAiOpen, setIsAiOpen] = useState(true);

  // Global Status Banner
  const [globalStatus, setGlobalStatus] = useState<string>('');

  useEffect(() => {
    setGlobalStatus(translations[currentLang].ide.workspaceInitialized);
  }, [currentLang]);

  // Collab team simulations
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Andrej Karpathy', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10', status: 'idle', cursor: { filePath: 'app.js', line: 12, ch: 0 } },
    { id: '2', name: 'Jensen Huang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', color: 'border-green-500 text-green-400 bg-green-500/10', status: 'typing', cursor: { filePath: 'app.js', line: 45, ch: 12 } },
    { id: '3', name: 'shadcn', avatar: 'https://avatars.githubusercontent.com/u/13989586?v=4', color: 'border-blue-500 text-blue-400 bg-blue-500/10', status: 'active', cursor: { filePath: 'index.html', line: 1, ch: 0 } },
  ]);

  const [simulatingCollaboration, setSimulatingCollaboration] = useState(false);

  // Simulate team collaboration typings in real-time
  useEffect(() => {
    if (!simulatingCollaboration) return;

    const interval = setInterval(() => {
      // Randomly update coworker typing status, line indices, or cursors
      setCollaborators(prev => prev.map(c => {
        if (Math.random() > 0.4) {
          const nextStatus = Math.random() > 0.6 ? 'typing' : 'idle';
          const nextLine = Math.floor(Math.random() * 40) + 1;
          const nextCh = Math.floor(Math.random() * 20);

          if (nextStatus === 'typing' && c.name === 'Jensen Huang') {
            setGlobalStatus(`Jensen Huang ${translations[currentLang].ide.coworkerTyping} ${c.cursor?.filePath || 'app.js'}...`);
          }

          return {
            ...c,
            status: nextStatus as any,
            cursor: {
              filePath: c.cursor?.filePath || 'app.js',
              line: nextLine,
              ch: nextCh
            }
          };
        }
        return c;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [simulatingCollaboration]);

  const handleSelectTemplate = (templateId: string) => {
    const found = templates.find((t) => t.id === templateId);
    if (found) {
      setActiveTemplate(found);
      setActiveFile(found.files[0] || null);
      setGlobalStatus(`Loaded workspace virtual template: "${found.name}"`);
    }
  };

  const handleSelectFile = (fileId: string) => {
    const found = activeTemplate.files.find((f) => f.id === fileId);
    if (found) {
      setActiveFile(found);
    }
  };

  const handleFileContentChange = (newContent: string) => {
    if (!activeFile) return;

    // Mutate internal active file structure locally
    const updatedFiles = activeTemplate.files.map((file) => {
      if (file.id === activeFile.id) {
        return { ...file, content: newContent };
      }
      return file;
    });

    setActiveTemplate(prev => ({ ...prev, files: updatedFiles }));
    setActiveFile(prev => prev ? { ...prev, content: newContent } : null);
  };

  const handleApplyCodePatch = (patchedCode: string) => {
    if (!activeFile) return;
    handleFileContentChange(patchedCode);
    setGlobalStatus(`Successfully integrated AI-patch directly inside "${activeFile.name}"!`);
  };

  const handleCreateFile = (name: string, language: string) => {
    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name,
      path: name,
      content: getStarterCodeForLanguage(language, name),
      language
    };

    const updatedTemplate = {
      ...activeTemplate,
      files: [...activeTemplate.files, newFile]
    };

    // Update global collection
    setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? updatedTemplate : t));
    setActiveTemplate(updatedTemplate);
    setActiveFile(newFile);
    setGlobalStatus(`Created new client-sandboxed file: "${name}"`);
  };

  const handleDeleteFile = (fileId: string) => {
    if (activeFile?.id === fileId) {
      setActiveFile(activeTemplate.files.find(f => f.id !== fileId) || null);
    }

    const updatedTemplate = {
      ...activeTemplate,
      files: activeTemplate.files.filter(f => f.id !== fileId)
    };

    setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? updatedTemplate : t));
    setActiveTemplate(updatedTemplate);
    setGlobalStatus('Successfully pruned workspace source file.');
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    let newLanguage = 'javascript';
    if (newName.endsWith('.html')) newLanguage = 'html';
    else if (newName.endsWith('.css')) newLanguage = 'css';
    else if (newName.endsWith('.json')) newLanguage = 'json';
    else if (newName.endsWith('.ts') || newName.endsWith('.tsx')) newLanguage = 'typescript';

    const updatedFiles = activeTemplate.files.map((file) => {
      if (file.id === fileId) {
        return { ...file, name: newName, path: newName, language: newLanguage };
      }
      return file;
    });

    const updatedTemplate = {
      ...activeTemplate,
      files: updatedFiles
    };

    setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? updatedTemplate : t));
    setActiveTemplate(updatedTemplate);
    if (activeFile?.id === fileId) {
      setActiveFile(prev => prev ? { ...prev, name: newName, path: newName, language: newLanguage } : null);
    }
    setGlobalStatus(`Renamed file to "${newName}"`);
  };

  const handleMoveFile = (fileId: string, newPath: string) => {
    const fileName = newPath.split('/').pop() || '';
    const updatedFiles = activeTemplate.files.map((file) => {
      if (file.id === fileId) {
        return { ...file, path: newPath, name: fileName || file.name };
      }
      return file;
    });

    const updatedTemplate = {
      ...activeTemplate,
      files: updatedFiles
    };

    setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? updatedTemplate : t));
    setActiveTemplate(updatedTemplate);
    if (activeFile?.id === fileId) {
      setActiveFile(prev => prev ? { ...prev, path: newPath, name: fileName || prev.name } : null);
    }
    setGlobalStatus(`Moved file to "${newPath}"`);
  };

  const getStarterCodeForLanguage = (language: string, filename: string): string => {
    switch (language) {
      case 'html':
        return `<!DOCTYPE html>\n<html>\n<head>\n  <title>${filename}</title>\n</head>\n<body>\n  <h2>${filename} placeholder</h2>\n</body>\n</html>`;
      case 'css':
        return `/* Styles for ${filename} */\nbody {\n  margin: 0;\n  background-color: #000;\n}`;
      case 'json':
        return `{\n  "name": "${filename}",\n  "version": "1.0.0"\n}`;
      default:
        return `// Start building ${filename} logic...\nconsole.log("${filename} module loaded successfully.");\n`;
    }
  };

  if (viewMode === 'landing') {
    return (
      <CursorLandingPage 
        onEnterIDE={() => setViewMode('ide')} 
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    );
  }

  return (
    <div id="codex-app-root" className="min-h-screen bg-[#070708] flex flex-col font-sans select-none overflow-hidden h-screen text-xs">
      
      {/* Top Header System Window Bar mimicking Codex Desktop precisely */}
      <header className="h-11 border-b border-[#141416]/50 bg-[#0b0b0d] flex items-center justify-between px-4 z-20 select-none shrink-0">
        {/* Linux/Mac Window controls */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Monospace App Title */}
        <div className="font-mono text-[10px] md:text-xs text-neutral-400 font-bold tracking-[0.15em] flex items-center gap-1">
          <span className="text-sky-500 font-black">&gt;_</span> CODEX DESKTOP - COMPOSER V2
        </div>

        {/* Port identifier and Back to Home button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewMode('landing');
              setGlobalStatus('Navigated back to landing page.');
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer"
            title="Return to Home Page"
          >
            {translations[currentLang].ide.home}
          </button>
          <span className="font-mono text-[9px] font-bold text-sky-450 text-neutral-400 border border-neutral-800 bg-[#0e0e11] px-2 py-0.5 rounded shadow-sm text-sky-400 tracking-wider">
            PORT 3000
          </span>
        </div>
      </header>

      {/* RENDER THE REVOLUTIONARY SOFTWARE OPERATING SYSTEM */}
      <div className="flex-1 min-h-0 w-full relative">
        <WorkspaceOS
          activeFile={activeFile}
          activeTemplate={activeTemplate}
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onMoveFile={handleMoveFile}
          onFileContentChange={handleFileContentChange}
          onApplyCodePatch={handleApplyCodePatch}
          currentLang={currentLang}
          collaborators={collaborators}
          simulatingCollaboration={simulatingCollaboration}
          setSimulatingCollaboration={setSimulatingCollaboration}
          globalStatus={globalStatus}
          setGlobalStatus={setGlobalStatus}
          onGoBackToLanding={() => setViewMode('landing')}
          
          editorPanel={
            <CustomEditor
              activeFile={activeFile}
              allFiles={activeTemplate.files}
              onSelectFile={handleSelectFile}
              onFileContentChange={handleFileContentChange}
              onSetGlobalStatus={setGlobalStatus}
              currentLang={currentLang}
            />
          }
          previewPanel={
            <LivePreview
              files={activeTemplate.files}
              activeTemplateName={activeTemplate.name}
              currentLang={currentLang}
            />
          }
          aiPanel={
            <AICopilot
              activeFile={activeFile}
              onApplyCodePatch={handleApplyCodePatch}
              currentLang={currentLang}
            />
          }
        />
      </div>

    </div>
  );
}
