/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isUnlocked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  codeBlock?: {
    code: string;
    language: string;
    fileName?: string;
  };
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'active' | 'idle' | 'typing';
  cursor?: {
    filePath: string;
    line: number;
    ch: number;
  };
}

export interface DeploymentTask {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  message: string;
  durationMs?: number;
}

export interface GithubRepo {
  id: string;
  name: string;
  owner: string;
  url: string;
  branch: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitTime: string;
}
