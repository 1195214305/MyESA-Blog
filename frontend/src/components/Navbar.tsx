import { motion } from "framer-motion";
import { Home, FileText, PenTool, FolderGit2, User, Music, Sun, Moon, Settings, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useThemeStore } from "@/store";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "./ThemeSelector";
import { SmartSearch } from "./SmartSearch";

const navItems = [
    { path: "/", label: "首页", icon: Home },
    { path: "/posts", label: "文稿", icon: FileText },
    { path: "/notes", label: "手记", icon: PenTool, highlight: true },
    { path: "/projects", label: "项目", icon: FolderGit2 },
    { path: "/guestbook", label: "留言", icon: MessageSquare },
    { path: "/about", label: "关于", icon: User },
];

export const Navbar = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useThemeStore();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
            <nav className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 px-3 py-1.5 mr-2">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                        TaoChen
                    </span>
                    <span className="text-lg">🌙</span>
                </Link>

                {/* Nav Items */}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                isActive
                                    ? "text-white"
                                    : theme === "dark"
                                        ? "text-slate-300 hover:text-white"
                                        : "text-slate-600 hover:text-slate-900",
                                item.highlight && !isActive && "text-orange-400"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-violet-500/80 to-cyan-500/80 rounded-full -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {item.highlight && <span className="text-orange-400">✏️</span>}
                            {!item.highlight && <Icon size={14} />}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                {/* Divider */}
                <div className="w-px h-6 bg-white/20 mx-2" />

                {/* Smart Search */}
                <SmartSearch />

                {/* Music Player Placeholder */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-400 hover:text-white transition-colors">
                    <Music size={16} />
                    <span className="hidden md:inline text-xs">星河乐章</span>
                </button>

                {/* Theme Selector */}
                <ThemeSelector />

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Settings */}
                <button className="p-2 rounded-full text-slate-400 hover:text-white transition-colors">
                    <Settings size={18} />
                </button>
            </nav>
        </motion.header>
    );
};
