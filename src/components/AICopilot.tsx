/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, CornerDownLeft, FileCheck, Zap, Scissors, Check } from 'lucide-react';
import { ChatMessage, CodeFile } from '../types';
import { translations } from '../translations';

interface AICopilotProps {
  activeFile: CodeFile | null;
  onApplyCodePatch: (patchedCode: string) => void;
  currentLang: 'en' | 'zh' | 'ja' | 'zht' | 'es' | 'fr' | 'pt' | 'ko' | 'de' | 'hi';
}

export default function AICopilot({ activeFile, onApplyCodePatch, currentLang }: AICopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        text: translations[currentLang].aiCopilot.welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isLoading) return;

    if (!textToSend) setInputText('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          activeFileCode: activeFile?.content || '',
          activeFileName: activeFile?.name || '',
          activeFileLanguage: activeFile?.language || '',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Detect code blocks to format inline or offer simple extraction
        let codeBlock: any = undefined;
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
        const match = data.text.match(codeBlockRegex);
        if (match) {
          codeBlock = {
            language: match[1] || 'javascript',
            code: match[2].trim(),
            fileName: activeFile?.name || 'suggested_patch.js',
          };
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            codeBlock,
          },
        ]);
      } else {
        throw new Error(data.error || 'Unknown endpoint failure');
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `${translations[currentLang].aiCopilot.errorText} (${e.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuickAction = (actionPrompt: string) => {
    if (!activeFile) return;
    const filledPrompt = `${actionPrompt} the active file "${activeFile.name}":\n\n\`\`\`${activeFile.language}\n${activeFile.content}\n\`\`\``;
    handleSendMessage(filledPrompt);
  };

  return (
    <div id="ai-copilot-container" className="flex flex-col h-full bg-brand-sidebar border-l border-border-subtle w-full h-full text-text-secondary">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border-subtle">
        <Bot className="w-4 h-4 text-accent-blue animate-pulse" />
        <span className="text-xs font-extrabold text-[#F1F5F9] tracking-wider uppercase font-sans">AI Co-Pilot Advisor</span>
        <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-blue/10 text-[9px] text-accent-blue border border-accent-blue/25 font-semibold font-sans">
          <Zap className="w-2.5 h-2.5 shrink-0" />
          Active Context
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1.5 max-w-[90%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              {msg.sender === 'user' ? (
                <>
                  <span className="font-semibold text-text-secondary font-sans">You</span>
                  <User className="w-3 h-3 text-text-muted" />
                </>
              ) : msg.sender === 'system' ? (
                <>
                  <Bot className="w-3 h-3 text-warning" />
                  <span className="text-warning font-semibold font-sans">System Sandbox</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-accent-blue" />
                  <span className="text-accent-blue font-extrabold font-sans">Codex LLM</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-[10px] leading-relaxed whitespace-pre-wrap break-words border ${
                msg.sender === 'user'
                  ? 'bg-accent-blue border-transparent text-text-primary rounded-tr-none shadow-[0_3px_12px_rgba(79,140,255,0.18)]'
                  : msg.sender === 'system'
                  ? 'bg-brand-secondary border-border-subtle text-text-muted text-[11px]'
                  : 'bg-brand-card border-[#1E293B] text-[#E2E8F0] rounded-tl-none'
              }`}
            >
              {msg.text}

              {/* Extraction code shortcut */}
              {msg.codeBlock && (
                <div className="mt-3 overflow-hidden rounded-[8px] border border-[#1E293B] bg-brand-main text-left text-[11px] font-mono leading-normal shadow-inner">
                  <div className="flex items-center justify-between px-3 py-2 bg-brand-secondary border-b border-[#1E293B]">
                    <span className="text-[10px] text-text-secondary font-bold font-mono">{msg.codeBlock.fileName} ({msg.codeBlock.language})</span>
                    <button
                      onClick={() => {
                        onApplyCodePatch(msg.codeBlock!.code);
                        const i = index;
                        setCopiedIndex(i);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-accent-blue text-text-primary hover:bg-accent-hover font-bold border-none transition-all cursor-pointer shadow-[0_2px_6px_rgba(79,140,255,0.25)]"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <Scissors className="w-3 h-3" />
                          <span>{translations[currentLang].aiCopilot.applyPatch}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 overflow-x-auto max-h-48 scrollbar-thin text-text-primary select-all">
                    <code>{msg.codeBlock.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-text-muted text-xs font-mono ml-2">
            <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce [animation-delay:0.4s]"></span>
            <span className="italic">Assistant thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Quick Utilities */}
      {activeFile && (
        <div className="p-3 bg-brand-secondary border-t border-border-subtle space-y-2">
          <span className="text-[9px] font-extrabold text-text-muted tracking-wider uppercase block font-sans">
            AI Quick Core Actions on file &quot;{activeFile.name}&quot;
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeQuickAction('Optimize and refactor')}
              disabled={isLoading}
              className="text-left px-2.5 py-2 bg-brand-card border border-border-subtle rounded-[10px] hover:border-accent-blue/30 text-[10px] text-text-secondary hover:text-accent-blue transition-all truncate cursor-pointer font-sans font-medium"
            >
              ⚡ Refactor & Optimize
            </button>
            <button
              onClick={() => executeQuickAction('Inject comprehensive logging')}
              disabled={isLoading}
              className="text-left px-2.5 py-2 bg-brand-card border border-border-subtle rounded-[10px] hover:border-accent-blue/30 text-[10px] text-text-secondary hover:text-accent-blue transition-all truncate cursor-pointer font-sans font-medium"
            >
              💬 Add Debug Logs
            </button>
            <button
              onClick={() => executeQuickAction('Write JSDoc comments of details')}
              disabled={isLoading}
              className="text-left px-2.5 py-2 bg-brand-card border border-border-subtle rounded-[10px] hover:border-accent-blue/30 text-[10px] text-text-secondary hover:text-accent-blue transition-all truncate cursor-pointer font-sans font-medium"
            >
              📝 Document Code
            </button>
            <button
              onClick={() => executeQuickAction('Explain how this algorithm functions')}
              disabled={isLoading}
              className="text-left px-2.5 py-2 bg-brand-card border border-border-subtle rounded-[10px] hover:border-accent-blue/30 text-[10px] text-text-secondary hover:text-accent-blue transition-all truncate cursor-pointer font-sans font-medium"
            >
              🔍 Explain Mechanics
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-3 bg-brand-sidebar border-t border-border-subtle font-sans pb-4">
        <div className="relative flex items-center bg-brand-secondary rounded-[10px] border border-border-subtle focus-within:border-accent-blue/50 transition-colors p-1 shadow-sm">
          <input
            type="text"
            className="flex-1 bg-transparent px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-0 leading-none"
            placeholder={translations[currentLang].aiCopilot.inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-2 bg-accent-blue text-[#FFFFFF] hover:bg-accent-hover rounded-[8px] transition-all cursor-pointer shadow-[0_2px_8px_rgba(79,140,255,0.2)]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[9px] text-text-muted mt-2 px-1">
          <span className="font-semibold select-none">Active Session Contextualizer</span>
          <span className="flex items-center gap-1 select-none">
            <span>Press Enter</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
