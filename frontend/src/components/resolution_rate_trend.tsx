import { FiActivity } from "react-icons/fi";
import { colors, gradients } from "./global_var";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
};

export const ResolutionRateTrend = ({ hoveredCard, setHoveredCard }: PRVelocityProps) => {
    const weeklyTrendData = [
        { week: 'W1', conflicts: 45, resolved: 42, rate: 93.3 },
        { week: 'W2', conflicts: 52, resolved: 49, rate: 94.2 },
        { week: 'W3', conflicts: 38, resolved: 37, rate: 97.4 },
        { week: 'W4', conflicts: 61, resolved: 58, rate: 95.1 }
    ];
    const [chartAnimated, setChartAnimated] = useState(false);

    // Trigger chart animation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
        setChartAnimated(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div 
          className="lg:col-span-3 group cursor-pointer"
          style={{
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hoveredCard === 'weekly-trend' ? 'translateY(-12px) scale(1.005)' : 'none',
            zIndex: hoveredCard === 'weekly-trend' ? 20 : 1
          }}
          onMouseEnter={() => setHoveredCard('weekly-trend')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="h-full flex flex-col relative overflow-hidden" style={{
            background: gradients.surface,
            borderRadius: '24px',
            border: `1px solid ${hoveredCard === 'weekly-trend' ? colors.accent : colors.border}`,
            boxShadow: hoveredCard === 'weekly-trend' ? 
              `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.accent}, 0 0 40px rgba(16, 185, 129, 0.3)` : 
              '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)',
            minHeight: '350px'
          }}>
            <div className="absolute inset-0 opacity-5" style={{
              background: gradients.accent,
              transform: hoveredCard === 'weekly-trend' ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.6s ease'
            }}></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.accent }}>
                <FiActivity className="mr-3" size={24} />
                WEEKLY RESOLUTION RATE ANALYSIS
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: gradients.accent,
                    boxShadow: `0 0 15px ${colors.accent}`,
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.accent }}>
                    TRENDING UP +2.3%
                  </span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(25, 35, 50, 0.6)',
                  color: 'rgba(220, 225, 235, 0.8)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.borderLight}`,
                  backdropFilter: 'blur(10px)'
                }}>
                  Last 4 weeks
                </span>
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={colors.accent} />
                      <stop offset="100%" stopColor={colors.primary} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(220, 225, 235, 0.1)" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(220, 225, 235, 0.7)', fontSize: 14 }}
                  />
                  <YAxis 
                    domain={[90, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(220, 225, 235, 0.7)', fontSize: 14 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: 'rgba(220, 225, 235, 0.9)' }}
                    formatter={(value, name) => [
                      `${value}%`,
                      name === 'rate' ? 'Resolution Rate' : name
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="url(#rateGradient)"
                    strokeWidth={4}
                    dot={{ 
                      fill: colors.accent, 
                      strokeWidth: 2, 
                      stroke: 'white',
                      r: 6
                    }}
                    activeDot={{ 
                      r: 8, 
                      fill: colors.accent,
                      stroke: 'white',
                      strokeWidth: 3,
                      boxShadow: `0 0 20px ${colors.accent}`
                    }}
                    isAnimationActive={chartAnimated}
                    animationDuration={1500}
                    animationBegin={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-4 gap-6 relative z-10">
              {weeklyTrendData.map((week, index) => (
                <div key={index} className="text-center p-4 rounded-xl" style={{
                  background: 'rgba(25, 35, 50, 0.6)',
                  border: `1px solid ${colors.borderLight}`,
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(220, 225, 235, 0.7)',
                    marginBottom: '4px'
                  }}>{week.week}</div>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: colors.accent,
                    marginBottom: '2px'
                  }}>{week.rate}%</div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(220, 225, 235, 0.6)'
                  }}>{week.resolved}/{week.conflicts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
    )
}