// ==================== 通用缓存工具 ====================
const CACHE_TTL = 30 * 60 * 1000; // 30分钟
const FAIL_CACHE_TTL = 5 * 60 * 1000; // 失败缓存5分钟，防止频繁重试

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl?: number; // 自定义TTL
}

function getCached<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        const ttl = entry.ttl || CACHE_TTL;
        if (Date.now() - entry.timestamp < ttl) {
            return entry.data;
        }
    } catch { /* 缓存读取失败忽略 */ }
    return null;
}

function setCache<T>(key: string, data: T, ttl?: number): void {
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch { /* 存储满或不可用忽略 */ }
}

// 请求去重：同一个 key 的并发请求共享同一个 Promise
const inflightRequests = new Map<string, Promise<any>>();

function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = inflightRequests.get(key);
    if (existing) return existing;
    const promise = fn().finally(() => inflightRequests.delete(key));
    inflightRequests.set(key, promise);
    return promise;
}

// ==================== 音乐播放器 ====================
export interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    audio: string;
    audiodownload: string;
    image: string;
    duration: number;
}

// 内置音乐列表（Jamendo API 不支持浏览器直接跨域调用，直接使用本地列表）
const BUILTIN_TRACKS: JamendoTrack[] = [
    {
        id: '1',
        name: 'Dreams',
        artist_name: 'Benjamin Tissot (Bensound)',
        audio: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        audiodownload: '',
        image: '',
        duration: 210
    },
    {
        id: '2',
        name: 'Relaxing',
        artist_name: 'Lesfm',
        audio: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
        audiodownload: '',
        image: '',
        duration: 156
    },
    {
        id: '3',
        name: 'Lofi Study',
        artist_name: 'FASSounds',
        audio: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_dbde409f02.mp3',
        audiodownload: '',
        image: '',
        duration: 138
    },
    {
        id: '4',
        name: 'Inspiring Cinematic',
        artist_name: 'Lexin_Music',
        audio: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_b12f12e1c3.mp3',
        audiodownload: '',
        image: '',
        duration: 170
    },
    {
        id: '5',
        name: 'Ambient Piano',
        artist_name: 'SergePavkinMusic',
        audio: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d9a7.mp3',
        audiodownload: '',
        image: '',
        duration: 105
    },
];

// Jamendo API 不允许浏览器跨域直接调用，直接返回内置列表
export async function searchJamendoTracks(_query: string, _limit = 10): Promise<JamendoTrack[]> {
    return BUILTIN_TRACKS;
}

export async function getPopularTracks(_limit = 20): Promise<JamendoTrack[]> {
    return BUILTIN_TRACKS;
}

export async function getTracksByGenre(_genre: string, _limit = 10): Promise<JamendoTrack[]> {
    return BUILTIN_TRACKS;
}

// ==================== GitHub API（带 localStorage 缓存） ====================
export interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    payload: any;
    created_at: string;
}

export function fetchGitHubEvents(username = '1195214305', limit = 10): Promise<GitHubEvent[]> {
    const cacheKey = `gh_events_${username}`;
    return dedup(cacheKey, async () => {
        const cached = getCached<GitHubEvent[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.github.com/users/${username}/events?per_page=${limit}`);
            if (!response.ok) {
                // 403限流时缓存空结果5分钟，防止重复请求
                setCache(cacheKey, [], FAIL_CACHE_TTL);
                return [];
            }
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch {
            setCache(cacheKey, [], FAIL_CACHE_TTL);
            return [];
        }
    });
}

// 格式化 GitHub 事件
export function formatGitHubEvent(event: GitHubEvent): { icon: string; text: string; time: string } {
    const repoName = event.repo.name.split('/')[1];
    const timeAgo = getRelativeTime(new Date(event.created_at));

    switch (event.type) {
        case 'PushEvent':
            const commits = event.payload.commits?.length || 0;
            return { icon: '🚀', text: `推送 ${commits} 个提交到 ${repoName}`, time: timeAgo };
        case 'CreateEvent':
            return { icon: '📂', text: `创建 ${event.payload.ref_type}: ${repoName}`, time: timeAgo };
        case 'WatchEvent':
            return { icon: '⭐', text: `收到 Star: ${repoName}`, time: timeAgo };
        case 'ForkEvent':
            return { icon: '🍴', text: `被 Fork: ${repoName}`, time: timeAgo };
        case 'IssuesEvent':
            return { icon: '🐛', text: `${event.payload.action} Issue: ${repoName}`, time: timeAgo };
        case 'PullRequestEvent':
            return { icon: '🔀', text: `${event.payload.action} PR: ${repoName}`, time: timeAgo };
        default:
            return { icon: '📌', text: `${event.type}: ${repoName}`, time: timeAgo };
    }
}

// 相对时间
function getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
}

// 一言 API
export interface Hitokoto {
    hitokoto: string;
    from: string;
    from_who: string | null;
}

export async function getHitokoto(): Promise<Hitokoto> {
    const response = await fetch('https://v1.hitokoto.cn/?c=i&c=k');
    return response.json();
}

// 天气 API (使用免费的 wttr.in)
export async function getWeather(city = 'Beijing'): Promise<string> {
    const response = await fetch(`https://wttr.in/${city}?format=%C+%t`);
    return response.text();
}

// GitHub 项目数据
export interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    language: string | null;
    updated_at: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    topics: string[];
}

// 部署链接映射
const ESA_DOMAIN = '.8a5362ec.er.aliyun-esa.net';

export function getDeploymentUrl(repoName: string): string {
    return `https://${repoName.toLowerCase()}${ESA_DOMAIN}`;
}

export function fetchGitHubRepos(): Promise<GitHubRepo[]> {
    const cacheKey = 'gh_repos';
    return dedup(cacheKey, async () => {
        const cached = getCached<GitHubRepo[]>(cacheKey);
        if (cached) return cached;

        try {
            const username = '1195214305';
            const response = await fetch(
                `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
            );
            if (!response.ok) {
                setCache(cacheKey, [], FAIL_CACHE_TTL);
                return [];
            }
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch {
            setCache(cacheKey, [], FAIL_CACHE_TTL);
            return [];
        }
    });
}

export function fetchRepoTree(repoName: string): Promise<any[]> {
    const cacheKey = `gh_tree_${repoName}`;
    return dedup(cacheKey, async () => {
        const cached = getCached<any[]>(cacheKey);
        if (cached) return cached;

        try {
            const username = '1195214305';
            const response = await fetch(
                `https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`
            );
            if (!response.ok) {
                setCache(cacheKey, [], FAIL_CACHE_TTL);
                return [];
            }
            const data = await response.json();
            const tree = data.tree || [];
            setCache(cacheKey, tree);
            return tree;
        } catch {
            setCache(cacheKey, [], FAIL_CACHE_TTL);
            return [];
        }
    });
}

// AI 服务配置预设
export const AI_PROVIDERS = {
    qwen: {
        name: '通义千问',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    },
    deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder'],
    },
    kimi: {
        name: 'Kimi (月之暗面)',
        baseUrl: 'https://api.moonshot.cn/v1',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
    },
    glm: {
        name: '智谱 GLM',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        models: ['glm-4', 'glm-4-flash'],
    },
    openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    },
    anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    },
    google: {
        name: 'Google AI',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'],
    },
};

