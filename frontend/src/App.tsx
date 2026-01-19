import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useThemeStore } from "@/store";
import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import { HomePage } from "@/pages/Home";
import { ProjectsPage } from "@/pages/Projects";
import { NotesPage } from "@/pages/Notes";
import { AboutPage } from "@/pages/About";
import { PostsPage } from "@/pages/Posts";
import { Guestbook } from "@/pages/Guestbook";

// Background images
import bgDark from "@/assets/images/bg-dark.png";
import bgLight from "@/assets/images/bg-light.png";

// 背景配置 - 使用图片或CSS渐变
type BgConfig = { type: 'image' | 'gradient'; value: string };
const BACKGROUNDS: Record<string, { dark: BgConfig; light: BgConfig }> = {
  space: {
    dark: { type: 'image', value: bgDark },
    light: { type: 'image', value: bgLight }
  },
  aurora: {
    dark: { type: 'gradient', value: 'linear-gradient(135deg, #0f2027 0%, #2c5364 50%, #203a43 100%)' },
    light: { type: 'image', value: bgLight }
  },
  cyberpunk: {
    dark: { type: 'gradient', value: 'linear-gradient(135deg, #000428 0%, #004e92 50%, #1a1a2e 100%)' },
    light: { type: 'image', value: bgLight }
  },
  warm: {
    dark: { type: 'image', value: bgDark },
    light: { type: 'gradient', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
  },
  sunset: {
    dark: { type: 'image', value: bgDark },
    light: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }
  },
  minimal: {
    dark: { type: 'gradient', value: '' },
    light: { type: 'gradient', value: '' }
  },
};

function App() {
  const { theme, background } = useThemeStore();

  const bgConfig = background && BACKGROUNDS[background]
    ? (theme === 'dark' ? BACKGROUNDS[background].dark : BACKGROUNDS[background].light)
    : (theme === 'dark' ? { type: 'image' as const, value: bgDark } : { type: 'image' as const, value: bgLight });

  // 计算背景样式
  const bgStyle = bgConfig.value
    ? bgConfig.type === 'image'
      ? {
        backgroundImage: `url(${bgConfig.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed" as const,
      }
      : {
        background: bgConfig.value,
      }
    : undefined;

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
          }`}
        style={bgStyle}
      >
        {/* Overlay for better readability */}
        <div
          className={`fixed inset-0 pointer-events-none ${theme === "dark" ? "bg-slate-950/70" : "bg-white/50"
            }`}
        />

        {/* Content */}
        <div className="relative z-10">
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/guestbook" element={<Guestbook />} />
            </Routes>
          </main>

          <AIAssistant />
        </div>
      </div>
    </Router>
  );
}

export default App;
