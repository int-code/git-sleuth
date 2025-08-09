import { FiBarChart2 } from "react-icons/fi";
import { gradients, colors } from "./global_var";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
};

// Mock data: confidence vs accepted (1) or rejected (0)
const confidenceData = [
  { confidence: 0.92, accepted: 1 },
  { confidence: 0.87, accepted: 1 },
  { confidence: 0.81, accepted: 1 },
  { confidence: 0.78, accepted: 0 },
  { confidence: 0.69, accepted: 0 },
  { confidence: 0.95, accepted: 1 },
  { confidence: 0.60, accepted: 0 },
];

export const AIConfidence = ({ hoveredCard, setHoveredCard }: PRVelocityProps) => {
  return (
    <div 
      className="group cursor-pointer"
      style={{
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hoveredCard === 'ai-confidence' ? 'translateY(-12px) scale(1.02)' : 'none',
        zIndex: hoveredCard === 'ai-confidence' ? 20 : 1
      }}
      onMouseEnter={() => setHoveredCard('ai-confidence')}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="h-full flex flex-col relative overflow-hidden" style={{
        background: gradients.surface,
        borderRadius: '24px',
        border: `1px solid ${hoveredCard === 'ai-confidence' ? colors.accent : colors.border}`,
        boxShadow: hoveredCard === 'ai-confidence' ? 
          `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.accent}, 0 0 40px rgba(16, 185, 129, 0.3)` : 
          '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
        padding: '32px',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          background: gradients.accent,
          transform: hoveredCard === 'ai-confidence' ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.6s ease'
        }}></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.accent }}>
            <FiBarChart2 className="mr-3" size={24} />
            AI CONFIDENCE
          </h3>
          <div className="flex items-center text-xs font-semibold">
            <div className="w-3 h-3 rounded-full mr-2" style={{
              background: gradients.accent,
              boxShadow: `0 0 15px ${colors.accent}`,
              animation: 'pulse 2s infinite'
            }} />
            <span>LIVE ANALYSIS</span>
          </div>
        </div>

        <div className="flex items-end space-x-4 mb-10 relative z-10">
          <span style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            lineHeight: 0.9,
            background: gradients.accent,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: hoveredCard === 'ai-confidence' ? '0 0 30px rgba(16, 185, 129, 0.5)' : 'none'
          }}>87%</span>
          <span className="pb-2 text-base font-semibold text-gray-300">current score</span>
        </div>

        {/* Correlation Chart */}
        <div className="relative z-10 h-52">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Confidence vs. Acceptance</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number" 
                dataKey="confidence" 
                name="Confidence" 
                domain={[0.5, 1]} 
                tick={{ fill: "#ccc", fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="accepted" 
                name="Accepted" 
                domain={[-0.1, 1.1]} 
                tick={{ fill: "#ccc", fontSize: 12 }} 
                tickFormatter={(v) => (v === 1 ? "Accepted" : "Rejected")}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
                formatter={(val, name) => [val, name === "accepted" ? "Status" : "Confidence"]}
              />
              <Scatter 
                name="Resolutions" 
                data={confidenceData} 
                fill={colors.accent} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
