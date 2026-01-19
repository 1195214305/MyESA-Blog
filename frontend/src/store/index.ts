import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    theme: 'light' | 'dark';
    background: 'space' | 'aurora' | 'cyberpunk' | 'warm' | 'sunset' | 'minimal';
    toggleTheme: () => void;
    setBackground: (bg: 'space' | 'aurora' | 'cyberpunk' | 'warm' | 'sunset' | 'minimal') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark',
            background: 'space',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
            setBackground: (bg) => set({ background: bg }),
        }),
        { name: 'theme-storage' }
    )
);

interface AIConfig {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl: string;
}

interface SettingsState {
    aiConfig: AIConfig;
    contactEmail: string; // 邮箱占位符
    hiddenProjects: string[]; // 隐藏的项目列表
    setAIConfig: (config: Partial<AIConfig>) => void;
    setContactEmail: (email: string) => void;
    hideProject: (repoName: string) => void;
    showProject: (repoName: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            aiConfig: {
                provider: 'qwen',
                model: 'qwen-plus',
                apiKey: '',
                baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            },
            contactEmail: '', // 用户可自行填写
            hiddenProjects: [], // 默认不隐藏任何项目
            setAIConfig: (config) => set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),
            setContactEmail: (email) => set({ contactEmail: email }),
            hideProject: (repoName) => set((state) => ({
                hiddenProjects: [...state.hiddenProjects, repoName]
            })),
            showProject: (repoName) => set((state) => ({
                hiddenProjects: state.hiddenProjects.filter(name => name !== repoName)
            })),
        }),
        { name: 'settings-storage' }
    )
);
