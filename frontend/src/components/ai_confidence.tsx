import { FiBarChart2 } from "react-icons/fi";
import { gradients, colors, type dataInterface } from "./global_var";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, BarChart, Bar } from 'recharts';

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
  data: dataInterface;
};

export const AIConfidence = ({ hoveredCard, setHoveredCard, data }: PRVelocityProps) => {
  
  const confidenceData = data.confidence_matrix.map((item, index) => ({
    confidenceRange: `${index * 10}-${(index + 1) * 10}%`,
    accepted: item[0],
    rejected: item[1],
    total: item[0] + item[1]
  }));
  
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: { total: number };
    }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm">
          <p className="font-semibold">{`Confidence: ${label}`}</p>
          <p style={{ color: colors.accent }}>{`Accepted: ${payload[0].value}`}</p>
          <p style={{ color: colors.danger }}>{`Rejected: ${payload[1]?.value || 0}`}</p>
          <p className="text-gray-300">{`Total: ${total}`}</p>
        </div>
      );
    }
    return null;
  };

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
        <div className="relative z-10 h-56 bg-gray-900 rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <h4 className="text-sm font-semibold text-gray-300">Confidence vs. Acceptance</h4>
          </div>
          <div className="h-full px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={confidenceData}
                margin={{ top: 10, right: 15, bottom: 60, left: 15 }}
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.08)" />
                <XAxis 
                  dataKey="confidenceRange"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="accepted" 
                  stackId="a" 
                  fill={colors.accent}
                  name="Accepted"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="rejected" 
                  stackId="a" 
                  fill={colors.danger}
                  name="Rejected"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};