// Jamendo API 配置
const JAMENDO_CLIENT_ID = 'b6747d04'; // 替换为实际的 client_id
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

export interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    audio: string;
    audiodownload: string;
    image: string;
    duration: number;
}

// 搜索歌曲
export async function searchJamendoTracks(query: string, limit = 10): Promise<JamendoTrack[]> {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&search=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
}

// 获取热门歌曲
export async function getPopularTracks(limit = 20): Promise<JamendoTrack[]> {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&order=popularity_total`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
}

// 按风格获取歌曲
export async function getTracksByGenre(genre: string, limit = 10): Promise<JamendoTrack[]> {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&tags=${encodeURIComponent(genre)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
}

// GitHub Events API
export interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    payload: any;
    created_at: string;
}

export async function fetchGitHubEvents(username = '1195214305', limit = 10): Promise<GitHubEvent[]> {
    const response = await fetch(`https://api.github.com/users/${username}/events?per_page=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
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

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
    const username = '1195214305';
    const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
    );
    if (!response.ok) throw new Error('Failed to fetch repos');
    return response.json();
}

export async function fetchRepoTree(repoName: string): Promise<any[]> {
    const username = '1195214305';
    const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`
    );
    if (!response.ok) throw new Error('Failed to fetch tree');
    const data = await response.json();
    return data.tree || [];
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

