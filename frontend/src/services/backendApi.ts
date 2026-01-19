// 后端 API 服务封装
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 通用请求方法
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });
    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}

// ==================== 文章 API ====================
export interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    tags: string;
    cover_image: string;
    views: number;
    likes: number;
    is_published: number;
    is_pinned: number;
    created_at: string;
    updated_at: string;
}

export const postsApi = {
    getAll: () => request<Post[]>('/api/posts'),
    getById: (id: string) => request<Post>(`/api/posts/${id}`),
    create: (data: Partial<Post>) => request<{ id: number }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Post>) => request<{ success: boolean }>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/api/posts/${id}`, {
        method: 'DELETE',
    }),
    like: (id: string) => request<{ success: boolean }>(`/api/posts/${id}/like`, {
        method: 'POST',
    }),
};

// ==================== 评论 API ====================
export interface Comment {
    id: number;
    post_id: string;
    author: string;
    content: string;
    created_at: string;
    likes?: number;
}

export const commentsApi = {
    getByPostId: (postId: string) => request<Comment[]>(`/api/comments/${postId}`),
    create: (data: { postId: string; author: string; content: string }) =>
        request<{ id: number }>('/api/comments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    like: (id: string) => request<{ success: boolean }>(`/api/comments/${id}/like`, {
        method: 'POST',
    }),
};

// ==================== 留言板 API ====================
export interface GuestbookEntry {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

export const guestbookApi = {
    getAll: () => request<GuestbookEntry[]>('/api/guestbook'),
    create: (data: { author: string; content: string; emoji?: string }) =>
        request<{ id: number }>('/api/guestbook', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ==================== 访问统计 API ====================
export interface Stats {
    totalVisits: number;
    todayVisits: number;
    postsCount: number;
    notesCount: number;
}

export const statsApi = {
    get: () => request<Stats>('/api/stats'),
    recordVisit: (page: string) =>
        request<{ success: boolean }>('/api/visits', {
            method: 'POST',
            body: JSON.stringify({ page }),
        }),
};

// ==================== 友链 API ====================
export interface Link {
    id: number;
    name: string;
    url: string;
    description: string;
    logo: string;
}

export const linksApi = {
    getAll: () => request<Link[]>('/api/links'),
    create: (data: Partial<Link>) =>
        request<{ id: number }>('/api/links', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    delete: (id: string) =>
        request<{ success: boolean }>(`/api/links/${id}`, {
            method: 'DELETE',
        }),
};

// ==================== 设置 API ====================
export const settingsApi = {
    get: (key: string) => request<{ value: string | null }>(`/api/settings/${key}`),
    set: (key: string, value: string) =>
        request<{ success: boolean }>(`/api/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
        }),
};
