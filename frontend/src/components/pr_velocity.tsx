import { useState } from "react";
import { gradients, colors } from "./global_var";
import { FiGitPullRequest} from 'react-icons/fi';

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
};

export const PRVelocity = ({ hoveredCard, setHoveredCard }: PRVelocityProps) => {
    
    return (
        <div 
          className="group cursor-pointer"
          style={{
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hoveredCard === 'pr-velocity' ? 'translateY(-12px) scale(1.02)' : 'none',
            zIndex: hoveredCard === 'pr-velocity' ? 20 : 1
          }}
          onMouseEnter={() => setHoveredCard('pr-velocity')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="h-full flex flex-col relative overflow-hidden" style={{
            background: gradients.surface,
            borderRadius: '24px',
            border: `1px solid ${hoveredCard === 'pr-velocity' ? colors.primary : colors.border}`,
            boxShadow: hoveredCard === 'pr-velocity' ? 
              `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.primary}, 0 0 40px rgba(99, 102, 241, 0.3)` : 
              '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-10" style={{
              background: gradients.primary,
              transform: hoveredCard === 'pr-velocity' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.6s ease'
            }}></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.primary }}>
                <FiGitPullRequest className="mr-3" size={24} />
                PR VELOCITY
              </h3>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.2)',
                color: colors.primary,
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid rgba(99, 102, 241, 0.4)`,
                backdropFilter: 'blur(10px)'
              }}>
                +12.4%
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <span style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                lineHeight: 0.9,
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
                textShadow: hoveredCard === 'pr-velocity' ? '0 0 30px rgba(99, 102, 241, 0.5)' : 'none'
              }}>24</span>
              <p style={{ 
                fontSize: '1rem', 
                color: 'rgba(220, 225, 235, 0.8)',
                marginBottom: '32px',
                fontWeight: 500
              }}>Pull requests this week</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(220, 225, 235, 0.6)' }}>Target: 30/wk</span>
                  <div className="mt-2 w-20 h-2 rounded-full" style={{ backgroundColor: 'rgba(220, 225, 235, 0.2)' }}>
                    <div className="h-full rounded-full" style={{
                      width: '80%',
                      background: gradients.accent,
                      transition: 'width 1s ease'
                    }}></div>
                  </div>
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  color: colors.accent,
                  fontWeight: 700,
                  textShadow: `0 0 15px ${colors.accent}`
                }}>80% efficiency</span>
              </div>
            </div>
          </div>
        </div>
    )
}
