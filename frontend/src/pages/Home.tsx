import { HeroSection } from "@/components/HeroSection";
import { MusicPlayer } from "@/components/MusicPlayer";
import { GitHubHeatmap } from "@/components/GitHubHeatmap";
import { KeywordCloud } from "@/components/KeywordCloud";
import { UpdateTimeline } from "@/components/UpdateTimeline";
import { HitokotoCard } from "@/components/HitokotoCard";
import { StatsCard } from "@/components/StatsCard";
import { FriendLinks } from "@/components/FriendLinks";
import { CalendarCard } from "@/components/CalendarCard";
import { TodoCard } from "@/components/TodoCard";
import { LatestContent } from "@/components/LatestContent";

export const HomePage = () => {
    return (
        <div className="pt-24 pb-20">
            <HeroSection />

            <div className="container mx-auto px-4 max-w-6xl space-y-6">
                {/* Row 1: Calendar + Stats + Todo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CalendarCard />
                    <StatsCard />
                    <TodoCard />
                </div>

                {/* Row 2: Hitokoto */}
                <HitokotoCard />

                {/* Row 3: Latest Content */}
                <LatestContent />

                {/* Row 4: Music + Updates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MusicPlayer />
                    <UpdateTimeline />
                </div>

                {/* Row 5: GitHub Heatmap */}
                <GitHubHeatmap />

                {/* Row 6: Keywords + Links */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <KeywordCloud />
                    <FriendLinks />
                </div>
            </div>
        </div>
    );
};
