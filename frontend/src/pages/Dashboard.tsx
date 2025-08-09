import { useState } from 'react';
import { Statusbar } from '../components/statusbar';
import { PRVelocity } from '../components/pr_velocity';
import { ConflictMatrix } from '../components/conflict_matrix';
import { AIConfidence } from '../components/ai_confidence';
import { ResolutionGraph } from '../components/conflict_resolution_graph';
import { MergeTiming } from '../components/merge_timing';
import { ResolutionRateTrend } from '../components/resolution_rate_trend';


type ActiveTabProp = {
  activeTab: string;
};

const Dashboard = ({ activeTab }: ActiveTabProp) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    activeTab == "home" &&
    <>
      <Statusbar />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-12 mt-4 transition-all duration-300">
        <PRVelocity hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        <ConflictMatrix hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        <AIConfidence hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        <ResolutionGraph hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        <MergeTiming hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        <ResolutionRateTrend hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
      </div>
    </>
  );
};

export default Dashboard;
