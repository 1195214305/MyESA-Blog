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

// 背景配置
const BACKGROUNDS: Record<string, { dark: string; light: string }> = {
  space: { dark: bgDark, light: bgLight },
  aurora: { dark: '/assets/images/bg-aurora.png', light: bgLight },
  cyberpunk: { dark: '/assets/images/bg-cyberpunk.png', light: bgLight },
  warm: { dark: bgDark, light: '/assets/images/bg-warm.png' },
  sunset: { dark: bgDark, light: '/assets/images/bg-sunset.png' },
  minimal: { dark: '', light: '' },
};

function App() {
  const { theme, background } = useThemeStore();

  const bgImage = background && BACKGROUNDS[background]
    ? (theme === 'dark' ? BACKGROUNDS[background].dark : BACKGROUNDS[background].light)
    : (theme === 'dark' ? bgDark : bgLight);

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
          }`}
        style={bgImage ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        } : undefined}
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
