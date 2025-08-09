import { FiAlertCircle } from "react-icons/fi";
import { gradients, colors } from "./global_var";

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
};

export const ConflictMatrix = ({ hoveredCard, setHoveredCard }: PRVelocityProps) => {
    return (
        <div 
            className="group cursor-pointer"
            style={{
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hoveredCard === 'conflict-matrix' ? 'translateY(-12px) scale(1.02)' : 'none',
            zIndex: hoveredCard === 'conflict-matrix' ? 20 : 1
            }}
            onMouseEnter={() => setHoveredCard('conflict-matrix')}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div className="h-full flex flex-col relative overflow-hidden" style={{
            background: gradients.surface,
            borderRadius: '24px',
            border: `1px solid ${hoveredCard === 'conflict-matrix' ? colors.secondary : colors.border}`,
            boxShadow: hoveredCard === 'conflict-matrix' ? 
                `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.secondary}, 0 0 40px rgba(139, 92, 246, 0.3)` : 
                '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)'
            }}>
            <div className="absolute inset-0 opacity-10" style={{
                background: gradients.secondary,
                transform: hoveredCard === 'conflict-matrix' ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.6s ease'
            }}></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.secondary }}>
                <FiAlertCircle className="mr-3" size={24} />
                CONFLICT MATRIX
                </h3>
                <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(139, 92, 246, 0.2)',
                color: colors.secondary,
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid rgba(139, 92, 246, 0.4)`,
                backdropFilter: 'blur(10px)'
                }}>
                AUTO-RESOLVED
                </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                {[
                { value: '42', label: 'Resolved', color: colors.accent, gradient: gradients.accent },
                { value: '8', label: 'Pending', color: colors.warning, gradient: `linear-gradient(135deg, ${colors.warning} 0%, rgb(251 191 36) 100%)` },
                { value: '3', label: 'Escalated', color: colors.danger, gradient: `linear-gradient(135deg, ${colors.danger} 0%, rgb(248 113 113) 100%)` }
                ].map((item, index) => (
                <div 
                    key={index}
                    className="group"
                    style={{
                    textAlign: 'center',
                    padding: '20px 12px',
                    borderRadius: '16px',
                    background: 'rgba(25, 35, 50, 0.6)',
                    border: `1px solid ${colors.borderLight}`,
                    transition: 'all 0.4s ease',
                    transform: hoveredCard === 'conflict-matrix' ? 'scale(1.05) translateY(-2px)' : 'none',
                    backdropFilter: 'blur(10px)'
                    }}
                >
                    <div style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    background: item.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                    }}>{item.value}</div>
                    <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(220, 225, 235, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                    }}>{item.label}</div>
                </div>
                ))}
            </div>
            
            <div className="relative z-10" style={{
                fontSize: '0.9rem',
                color: 'rgba(220, 225, 235, 0.8)',
                textAlign: 'center'
            }}>
                <span style={{ 
                color: colors.secondary,
                fontWeight: 700,
                fontSize: '1.1rem'
                }}>95%</span> auto-resolution success rate
            </div>
            </div>
        </div>
    )
}