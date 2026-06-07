/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  ArrowUpRight, 
  Check, 
  RefreshCw,
  GitMerge,
  Terminal,
  Layers,
  ChevronDown,
  GithubIcon,
  Github
} from 'lucide-react';
import { GithubRepo, CodeFile } from '../types';
import { translations } from '../translations';

interface GithubIntegrationProps {
  activeFile: CodeFile | null;
  files: CodeFile[];
  onSetGlobalStatus: (msg: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

interface Commit {
  sha: string;
  author: string;
  message: string;
  time: string;
  branch: string;
}

export default function GithubIntegration({ 
  activeFile, 
  files, 
  onSetGlobalStatus,
  currentLang
}: GithubIntegrationProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [activeBranch, setActiveBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [repoDetails] = useState<GithubRepo>({
    id: 'repo-1',
    name: 'codex-predictive-sandbox',
    owner: 'azadali201151',
    branch: 'main',
    url: 'https://github.com/azadali201151/codex-predictive-sandbox',
    lastCommitSha: 'ef02ba3',
    lastCommitMessage: 'refactor: integrate zero-overhead pipeline validation logic',
    lastCommitTime: '10 minutes ago'
  });

  const [commits, setCommits] = useState<Commit[]>([
    {
      sha: 'ef02ba3',
      author: 'azadali201151',
      message: 'refactor: integrate zero-overhead pipeline validation logic',
      time: '10 minutes ago',
      branch: 'main'
    },
    {
      sha: '6d91da4',
      author: 'copilot-agent',
      message: 'feat: design and compile visual Canvas Physics sandboxes',
      time: '2 hours ago',
      branch: 'main'
    },
    {
      sha: 'a12c98b',
      author: 'azadali201151',
      message: 'initial: scaffold workspace state containers',
      time: 'Yesterday',
      branch: 'main'
    },
  ]);

  const handleCommitAndPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    setIsSyncing(true);
    onSetGlobalStatus('Initiating remote git flow...');

    setTimeout(() => {
      const newCommit: Commit = {
        sha: Math.random().toString(16).substring(2, 9),
        author: 'azadali201151',
        message: commitMessage,
        time: 'Just now',
        branch: activeBranch
      };

      setCommits([newCommit, ...commits]);
      setCommitMessage('');
      setIsSyncing(false);
      onSetGlobalStatus(`Changes pushed to branch ${activeBranch} successfully!`);
    }, 1800);
  };

  return (
    <div id="github-panel-container" className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 text-neutral-300 w-full lg:w-80">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-neutral-800">
        <Github className="w-4 h-4 text-neutral-100" />
        <span className="text-xs font-bold text-neutral-100 uppercase tracking-wide">{translations[currentLang].github.panelTitle}</span>
        <span className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[9px] text-emerald-400 border border-emerald-500/20">
          ● {translations[currentLang].github.connectedStatus}
        </span>
      </div>

      {/* Repo Metadata Header Cards */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-500 font-medium">{translations[currentLang].github.repository}</span>
            <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-800 font-mono">
              HTTPS
            </span>
          </div>
          <h2 className="text-xs font-bold text-neutral-100 flex items-center gap-1 truncate" title={repoDetails.url}>
            {repoDetails.owner} / <span className="text-sky-400">{repoDetails.name}</span>
          </h2>
          <p className="text-[10px] text-neutral-500 mt-1 truncate">
            {repoDetails.url}
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <GitBranch className="w-3.5 h-3.5 text-sky-400 bg-sky-400/5 p-0.5 rounded" />
            <span className="font-semibold">{activeBranch}</span>
          </div>
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-transparent text-[10px] text-neutral-400 focus:outline-none cursor-pointer text-right"
          >
            <option value="main">main</option>
            <option value="feature/autocomplete">feature/autocomplete</option>
            <option value="bugfix/gravity-accel">bugfix/gravity-accel</option>
          </select>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Uncommitted Modifications State */}
        <div>
          <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase block mb-2">
            {translations[currentLang].github.changesHeader}
          </span>
          <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-300">Staged Files list</span>
              <span className="text-sky-400 font-semibold text-[10px]">Ready to Commit</span>
            </div>

            {/* List with modifications highlights */}
            <div className="space-y-1.5">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-neutral-950 p-2 rounded-lg border border-neutral-800/40 text-[11px]">
                  <span className="font-mono text-neutral-400 text-left truncate max-w-[140px]">
                    {f.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded">
                      MODIFIED
                    </span>
                    <span className="text-neutral-500 text-[10px]">+{f.content.split('\n').length} lines</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Live Diff Highlight Output */}
            {activeFile && (
              <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-[9px] mt-3">
                <div className="bg-neutral-900 px-2.5 py-1 text-[10px] text-neutral-400 border-b border-neutral-800 flex justify-between">
                  <span>diff --git a/{activeFile.name} b/{activeFile.name}</span>
                </div>
                <div className="p-2 space-y-1 max-h-24 overflow-y-auto select-none scrollbar-thin">
                  <div className="text-teal-400 bg-teal-950/20 px-1 truncate">
                    + [Codex Developer Integration Header]
                  </div>
                  <div className="text-neutral-500 px-1 truncate">
                    {activeFile.content.split('\n')[0] || '// code start'}
                  </div>
                  <div className="text-rose-400 bg-rose-950/20 px-1 truncate">
                    - // old legacy structure
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commitment form pipeline console block */}
        <div>
          <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase block mb-2">
            Commit Changes to Branch
          </span>
          <form onSubmit={handleCommitAndPush} className="space-y-2.5">
            <textarea
              required
              rows={2}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={translations[currentLang].github.commitPlaceholder}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-sky-500 font-sans"
            />
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-950 font-semibold py-2 px-3 rounded-lg hover:bg-white text-xs disabled:opacity-50 transition-colors"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{translations[currentLang].github.pushing}</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{translations[currentLang].github.commitBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Graphical commit tree visualization */}
        <div>
          <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase block mb-3">
            {translations[currentLang].github.recentActivity}
          </span>
          <div className="relative pl-6 space-y-4">
            {/* Draw the vertical branch line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-neutral-800"></div>

            {commits.map((c, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={c.sha} className="relative text-[11px] space-y-1">
                  {/* Committer circle dot indicator */}
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${
                    isFirst 
                      ? 'bg-sky-500 border-sky-400 animate-pulse' 
                      : 'bg-neutral-950 border-neutral-700'
                  }`}></div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-300 font-mono text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                      {c.sha}
                    </span>
                    <span className="text-[10px] text-neutral-500">{c.time}</span>
                  </div>
                  <p className="text-neutral-400 leading-normal font-sans font-medium line-clamp-2">
                    {c.message}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    by <span className="text-neutral-400 font-medium">@{c.author}</span> to <span className="text-neutral-400">{c.branch}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
