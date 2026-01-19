// Jamendo API 配置 - 使用CORS代理
const JAMENDO_CLIENT_ID = 'b6747d04';
// 使用公共CORS代理或直接返回静态数据作为降级方案
const CORS_PROXY = '';  // 生产环境禁用代理，使用降级方案
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

// 默认音乐列表（使用免费可用的音乐源）
// 来源：Internet Archive 公共域音乐
const DEFAULT_TRACKS: JamendoTrack[] = [
    {
        id: '1',
        name: 'Clair de Lune',
        artist_name: 'Debussy',
        audio: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Clair_de_Lune_%28Suite_Bergamasque%29.ogg',
        audiodownload: '',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Claude_Debussy_ca_1908%2C_foto_av_Félix_Nadar.jpg/220px-Claude_Debussy_ca_1908%2C_foto_av_Félix_Nadar.jpg',
        duration: 300
    },
    {
        id: '2',
        name: 'Gymnopédie No.1',
        artist_name: 'Erik Satie',
        audio: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Erik_Satie_-_gymnopédie_1.ogg',
        audiodownload: '',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erik_Satie_1895.jpg/220px-Erik_Satie_1895.jpg',
        duration: 200
    },
    {
        id: '3',
        name: 'Moonlight Sonata',
        artist_name: 'Beethoven',
        audio: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Beethoven%27s_Moonlight_Sonata.ogg',
        audiodownload: '',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/220px-Beethoven.jpg',
        duration: 360
    },
    {
        id: '4',
        name: 'Für Elise',
        artist_name: 'Beethoven',
        audio: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Bagatelle_No._25_in_A_minor.ogg',
        audiodownload: '',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/220px-Beethoven.jpg',
        duration: 180
    },
    {
        id: '5',
        name: 'Prelude in C Major',
        artist_name: 'J.S. Bach',
        audio: 'https://upload.wikimedia.org/wikipedia/commons/3/36/BWV846a.ogg',
        audiodownload: '',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Johann_Sebastian_Bach.jpg/220px-Johann_Sebastian_Bach.jpg',
        duration: 150
    },
];

// 搜索歌曲
export async function searchJamendoTracks(query: string, limit = 10): Promise<JamendoTrack[]> {
    try {
        const url = `${CORS_PROXY}${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&search=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || DEFAULT_TRACKS;
    } catch (error) {
        console.warn('Jamendo API unavailable, using default tracks');
        return DEFAULT_TRACKS;
    }
}

// 获取热门歌曲
export async function getPopularTracks(limit = 20): Promise<JamendoTrack[]> {
    try {
        const url = `${CORS_PROXY}${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&order=popularity_total`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || DEFAULT_TRACKS;
    } catch (error) {
        console.warn('Jamendo API unavailable, using default tracks');
        return DEFAULT_TRACKS;
    }
}

// 按风格获取歌曲
export async function getTracksByGenre(genre: string, limit = 10): Promise<JamendoTrack[]> {
    try {
        const url = `${CORS_PROXY}${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&tags=${encodeURIComponent(genre)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || DEFAULT_TRACKS;
    } catch (error) {
        console.warn('Jamendo API unavailable, using default tracks');
        return DEFAULT_TRACKS;
    }
}

// GitHub Events API（带降级处理）
export interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    payload: any;
    created_at: string;
}

// 默认事件（降级方案）
const DEFAULT_EVENTS: GitHubEvent[] = [
    { id: '1', type: 'PushEvent', repo: { name: 'user/MyESA-Blog' }, payload: { commits: [{}] }, created_at: new Date().toISOString() },
    { id: '2', type: 'CreateEvent', repo: { name: 'user/EcoLens' }, payload: { ref_type: 'repository' }, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export async function fetchGitHubEvents(username = '1195214305', limit = 10): Promise<GitHubEvent[]> {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events?per_page=${limit}`);
        if (!response.ok) {
            console.warn('GitHub API rate limited, using cached data');
            return DEFAULT_EVENTS;
        }
        return response.json();
    } catch (error) {
        console.warn('GitHub API unavailable, using cached data');
        return DEFAULT_EVENTS;
    }
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
    try {
        const username = '1195214305';
        const response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
        );
        if (!response.ok) {
            console.warn('GitHub repos API rate limited');
            return [];
        }
        return response.json();
    } catch (error) {
        console.warn('GitHub repos API unavailable');
        return [];
    }
}

export async function fetchRepoTree(repoName: string): Promise<any[]> {
    try {
        const username = '1195214305';
        const response = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`
        );
        if (!response.ok) {
            console.warn('GitHub tree API rate limited');
            return [];
        }
        const data = await response.json();
        return data.tree || [];
    } catch (error) {
        console.warn('GitHub tree API unavailable');
        return [];
    }
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

