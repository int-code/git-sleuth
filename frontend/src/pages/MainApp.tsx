import Dashboard from './Dashboard'
import { Navigation } from '../components/navbar';
import { colors, gradients } from '../components/global_var';
import { MergeConflict } from './MergeConflict';
import { Integrations } from './Integration';
import { useState } from 'react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden transition-all duration-300 ease-in-out"
      style={{
        background: `radial-gradient(circle at 25% 30%, rgba(20,30,60,0.5), ${colors.background})`,
        color: 'rgb(225 230 245)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        letterSpacing: '0.3px'
      }}
    >
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <Dashboard activeTab={activeTab} />
      <MergeConflict activeTab={activeTab} />
      <Integrations activeTab={activeTab} />
      {/* Global Polished Styles */}
      <style tsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: ${colors.background};
        }

        * {
          box-sizing: border-box;
          transition: all 0.2s ease-in-out;
        }

        .dashboard-card {
          background: ${gradients.surface};
          border-radius: 1rem;
          border: 1px solid ${colors.border};
          padding: 1.5rem;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          backdrop-filter: blur(12px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 24px rgba(0,0,0,0.25);
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(25, 35, 50, 0.5);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondaryDark} 100%);
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          height: 100%;
          width: 150%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .gradient-border {
          position: relative;
          background: ${gradients.surface};
          border-radius: 1rem;
          padding: 1px;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          background: ${gradients.primary};
          border-radius: 1rem;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }

        .status-connected {
          background: ${colors.primary};
          animation: pulse 2s infinite;
        }

        .status-disconnected {
          background: ${colors.border};
        }
      `}</style>
    </div>
  )
}

export default MainApp
