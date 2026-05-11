import { cached } from '../cache.js';
import { getEnv, getTrackedFigmaFiles } from '../config.js';

const BASE_URL = 'https://api.figma.com/v1';

async function fetchFigma<T>(endpoint: string): Promise<T> {
  const token = getEnv('FIGMA_ACCESS_TOKEN');
  if (!token) {
    throw new Error('FIGMA_ACCESS_TOKEN not set');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface FigmaFile {
  key: string;
  name: string;
  last_modified: string;
  thumbnail_url?: string;
}

export interface FigmaComment {
  id: string;
  file_key: string;
  file_name: string;
  message: string;
  user: {
    handle: string;
    img_url?: string;
  };
  created_at: string;
  resolved_at?: string;
}

export interface FigmaVersion {
  id: string;
  file_key: string;
  file_name: string;
  label?: string;
  description?: string;
  user: {
    handle: string;
  };
  created_at: string;
}

interface FileResponse {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
}

interface CommentsResponse {
  comments: Array<{
    id: string;
    message: string;
    user: {
      handle: string;
      img_url?: string;
    };
    created_at: string;
    resolved_at?: string;
  }>;
}

interface VersionsResponse {
  versions: Array<{
    id: string;
    label?: string;
    description?: string;
    user: {
      handle: string;
    };
    created_at: string;
  }>;
}

export async function getFileInfo(fileKey: string, fileName?: string): Promise<FigmaFile> {
  return cached(
    `figma:file:${fileKey}`,
    async () => {
      const data = await fetchFigma<FileResponse>(`/files/${fileKey}?depth=1`);
      return {
        key: fileKey,
        name: data.name || fileName || fileKey,
        last_modified: data.lastModified,
        thumbnail_url: data.thumbnailUrl,
      };
    },
    { ttl: 300 }
  );
}

export async function getFileComments(
  fileKey: string,
  fileName?: string
): Promise<FigmaComment[]> {
  return cached(
    `figma:comments:${fileKey}`,
    async () => {
      const data = await fetchFigma<CommentsResponse>(`/files/${fileKey}/comments`);
      return data.comments.map(c => ({
        id: c.id,
        file_key: fileKey,
        file_name: fileName || fileKey,
        message: c.message,
        user: {
          handle: c.user.handle,
          img_url: c.user.img_url,
        },
        created_at: c.created_at,
        resolved_at: c.resolved_at,
      }));
    },
    { ttl: 300 }
  );
}

export async function getFileVersions(
  fileKey: string,
  fileName?: string,
  limit = 10
): Promise<FigmaVersion[]> {
  return cached(
    `figma:versions:${fileKey}:${limit}`,
    async () => {
      const data = await fetchFigma<VersionsResponse>(`/files/${fileKey}/versions`);
      return data.versions.slice(0, limit).map(v => ({
        id: v.id,
        file_key: fileKey,
        file_name: fileName || fileKey,
        label: v.label,
        description: v.description,
        user: { handle: v.user.handle },
        created_at: v.created_at,
      }));
    },
    { ttl: 300 }
  );
}

export async function getTrackedFilesActivity() {
  const trackedFiles = getTrackedFigmaFiles();

  if (trackedFiles.length === 0) {
    return {
      files: [],
      comments: [],
      versions: [],
      summary: {
        total_files: 0,
        unresolved_comments: 0,
        recent_versions: 0,
      },
    };
  }

  const results = await Promise.allSettled(
    trackedFiles.map(async file => {
      const [info, comments, versions] = await Promise.all([
        getFileInfo(file.file_key, file.name),
        getFileComments(file.file_key, file.name),
        getFileVersions(file.file_key, file.name, 5),
      ]);
      return { info, comments, versions };
    })
  );

  const files: FigmaFile[] = [];
  const allComments: FigmaComment[] = [];
  const allVersions: FigmaVersion[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      files.push(result.value.info);
      allComments.push(...result.value.comments);
      allVersions.push(...result.value.versions);
    }
  }

  // Sort by date
  allComments.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  allVersions.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const unresolvedComments = allComments.filter(c => !c.resolved_at);
  const day = 24 * 60 * 60 * 1000;
  const recentVersions = allVersions.filter(
    v => Date.now() - new Date(v.created_at).getTime() < day
  );

  return {
    files,
    comments: allComments.slice(0, 20),
    versions: allVersions.slice(0, 10),
    summary: {
      total_files: files.length,
      unresolved_comments: unresolvedComments.length,
      recent_versions: recentVersions.length,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('FIGMA_ACCESS_TOKEN');
}
