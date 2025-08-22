import { use, useState } from 'react';
import { Statusbar } from '../components/statusbar';
import { PRVelocity } from '../components/pr_velocity';
import { ConflictMatrix } from '../components/conflict_matrix';
import { AIConfidence } from '../components/ai_confidence';
import { ResolutionGraph } from '../components/conflict_resolution_graph';
import { MergeTiming } from '../components/merge_timing';
import { ResolutionRateTrend } from '../components/resolution_rate_trend';
import type { dataInterface } from '../components/global_var';


type ActiveTabProp = {
  activeTab: string;
};

const Dashboard = ({ activeTab }: ActiveTabProp) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [data, setData] = useState<dataInterface>({
    systems_operational: true,
    pr_count: 0,
    pr_change_percentage: 0,
    num_resolved: 0,
    num_pending: 0,
    num_accepted: 0,
    confidence_matrix: [],
    conflict_matrix: {},
    pr_conflict_timing: []
  });

  return (
    activeTab === "home" &&
    <>
      <Statusbar data={data} setData={setData} />

      {data.pr_count > 0 ? (
        // Dashboard Grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-12 mt-4 transition-all duration-300">
          <PRVelocity hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data} />
          <ConflictMatrix hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data} />
          <AIConfidence hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data} />
          <ResolutionGraph hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data} />
          <MergeTiming hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data} />
          {/* <ResolutionRateTrend hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} data={data}/> */}
        </div>
      ) : (
        // Alternative View
        <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m-7.5 7.5h15a2.25 2.25 0 002.25-2.25v-15A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75v15a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-lg font-semibold">Not enough data to display 📉</p>
          <p className="text-sm text-gray-400">Once PR activity starts, insights will appear here.</p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
