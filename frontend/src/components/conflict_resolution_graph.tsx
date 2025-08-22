import { FiTrendingUp } from "react-icons/fi";
import { colors, gradients, type dataInterface } from "./global_var";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
  data: dataInterface;
};


export const ResolutionGraph = ({ hoveredCard, setHoveredCard, data }: PRVelocityProps) =>{
    const transformData = (data: Record<string, { resolved: number; pending: number; escalated: number }>) => {
        return Object.entries(data).map(([day, stats]) => ({
            day,
            ...stats
        }));
    };
    const conflictTrendData = transformData(data.conflict_matrix);
    // const conflictTrendData = [
    //     { day: 'Mon', resolved: 12, pending: 3, escalated: 1 },
    //     { day: 'Tue', resolved: 18, pending: 5, escalated: 2 },
    //     { day: 'Wed', resolved: 15, pending: 2, escalated: 0 },
    //     { day: 'Thu', resolved: 22, pending: 4, escalated: 1 },
    //     { day: 'Fri', resolved: 19, pending: 1, escalated: 0 },
    //     { day: 'Sat', resolved: 8, pending: 0, escalated: 0 },
    //     { day: 'Sun', resolved: 6, pending: 1, escalated: 0 }
    // ];
    return (
        <div 
            className="lg:col-span-2 group cursor-pointer"
            style={{
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hoveredCard === 'trend-graph' ? 'translateY(-12px) scale(1.01)' : 'none',
            zIndex: hoveredCard === 'trend-graph' ? 20 : 1
            }}
            onMouseEnter={() => setHoveredCard('trend-graph')}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div className="h-full flex flex-col relative overflow-hidden" style={{
            background: gradients.surface,
            borderRadius: '24px',
            border: `1px solid ${hoveredCard === 'trend-graph' ? colors.primary : colors.border}`,
            boxShadow: hoveredCard === 'trend-graph' ? 
                `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.primary}, 0 0 40px rgba(99, 102, 241, 0.3)` : 
                '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)',
            minHeight: '400px'
            }}>
            <div className="absolute inset-0 opacity-5" style={{
                background: gradients.primary,
                transform: hoveredCard === 'trend-graph' ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.6s ease'
            }}></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.primary }}>
                <FiTrendingUp className="mr-3" size={24} />
                MERGE CONFLICT RESOLUTION TRENDS
                </h3>
                <div className="flex space-x-4">
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: colors.accent,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid rgba(16, 185, 129, 0.4)`,
                    backdropFilter: 'blur(10px)'
                }}>
                    WEEKLY VIEW
                </span>
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
                    Last 7 days
                </span>
                </div>
            </div>
            
            <div className="flex-1 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conflictTrendData}>
                    <defs>
                    <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.accent} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={colors.accent} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.warning} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={colors.warning} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="escalatedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.danger} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={colors.danger} stopOpacity={0.1}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(220, 225, 235, 0.1)" />
                    <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(220, 225, 235, 0.7)', fontSize: 12 }}
                    />
                    <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(220, 225, 235, 0.7)', fontSize: 12 }}
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
                    />
                    <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="1"
                    stroke={colors.accent}
                    strokeWidth={2}
                    fill="url(#resolvedGradient)"
                    />
                    <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke={colors.warning}
                    strokeWidth={2}
                    fill="url(#pendingGradient)"
                    />
                    <Area
                    type="monotone"
                    dataKey="escalated"
                    stackId="1"
                    stroke={colors.danger}
                    strokeWidth={2}
                    fill="url(#escalatedGradient)"
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex justify-center space-x-8 relative z-10">
                <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.accent }}></div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(220, 225, 235, 0.8)' }}>Resolved</span>
                </div>
                <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.warning }}></div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(220, 225, 235, 0.8)' }}>Pending</span>
                </div>
                <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.danger }}></div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(220, 225, 235, 0.8)' }}>Escalated</span>
                </div>
            </div>
            </div>
        </div>
    )
}