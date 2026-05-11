import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { homedir } from 'os';
import { join } from 'path';

export interface TrackedRepo {
  owner: string;
  repo: string;
  full: string;
}

export interface TrackedFigmaFile {
  file_key: string;
  name: string;
}

export interface DesignOpsConfig {
  version: string;
  pillars: {
    operations: {
      enabled: boolean;
      tools: Array<{
        id: string;
        type: string;
        api?: {
          token_env?: string;
        };
      }>;
    };
    design: {
      enabled: boolean;
      tools: Array<{
        id: string;
        type: string;
        api?: {
          token_env?: string;
        };
        tracked_repos?: string[];
        tracked_files?: TrackedFigmaFile[];
      }>;
    };
    analytics: {
      enabled: boolean;
      tools: Array<{
        id: string;
        category: string;
        type: string;
        api?: {
          token_env?: string;
          base_url?: string;
        };
      }>;
    };
  };
  preferences: {
    activity_window_hours: number;
    show_prs: boolean;
    show_commits: boolean;
    show_versions: boolean;
    show_figma_comments: boolean;
  };
}

let cachedConfig: DesignOpsConfig | null = null;

export function loadConfig(): DesignOpsConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = join(homedir(), '.claude', 'design-ops-config.yaml');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const content = readFileSync(configPath, 'utf-8');
  cachedConfig = parse(content) as DesignOpsConfig;
  return cachedConfig;
}

export function getTrackedRepos(): TrackedRepo[] {
  const config = loadConfig();
  const githubTool = config.pillars.design.tools.find(t => t.id === 'github');
  const repos = githubTool?.tracked_repos || [];

  return repos.map(repo => {
    const [owner, name] = repo.split('/');
    return { owner, repo: name, full: repo };
  });
}

export function getTrackedFigmaFiles(): TrackedFigmaFile[] {
  const config = loadConfig();
  const figmaTool = config.pillars.design.tools.find(t => t.id === 'figma');
  return figmaTool?.tracked_files || [];
}

export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
