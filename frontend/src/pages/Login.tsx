import { useState, useEffect } from 'react';
import { Github, Star, GitBranch, Code, Users } from 'lucide-react';

const GitHubLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGitHubLogin = () => {
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL+"/login";
    window.location.href = apiUrl;
  };

  type FloatingIconProps = {
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    delay: number;
    size?: number;
    className?: string;
  };

  const FloatingIcon = ({ Icon, delay, size = 24, className = "" }: FloatingIconProps) => (
    <div 
      className={`absolute opacity-20 animate-pulse ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      <Icon size={size} className="text-cyan-400" />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          33% { transform: translateY(-10px); }
          66% { transform: translateY(5px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(93, 218, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(93, 218, 255, 0.6); }
        }
        
        @keyframes matrix {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        
        .matrix-element {
          animation: matrix 8s linear infinite;
        }
      `}</style>

      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
        style={{ 
          background: 'rgb(10, 10, 25)',
          backgroundImage: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(93, 218, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(186, 104, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 99, 164, 0.1) 0%, transparent 50%)
          `
        }}
      >
        
        {/* Animated Background Matrix */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute matrix-element opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            <div className="text-cyan-400 font-mono text-xs">
              {Math.random().toString(36).substring(7)}
            </div>
          </div>
        ))}

        {/* Floating Code Icons */}
        <FloatingIcon Icon={Code} delay={0} className="top-20 left-20" />
        <FloatingIcon Icon={GitBranch} delay={1} className="top-32 right-32" size={20} />
        <FloatingIcon Icon={Star} delay={2} className="bottom-40 left-40" size={18} />
        <FloatingIcon Icon={Users} delay={3} className="bottom-20 right-20" size={22} />
        <FloatingIcon Icon={Github} delay={4} className="top-60 left-60" size={28} />

        {/* Main Container */}
        <div className="w-full max-w-lg relative">

          {/* Main Card */}
          <div className="relative backdrop-blur-xl rounded-3xl p-12 shadow-2xl border floating-element"
               style={{ 
                 background: 'linear-gradient(135deg, rgba(18, 18, 40, 0.9) 0%, rgba(28, 28, 58, 0.8) 100%)',
                 borderColor: 'rgba(60, 70, 100, 0.5)',
                 boxShadow: `
                   0 25px 50px -12px rgba(0, 0, 0, 0.5),
                   inset 0 1px 0 rgba(255, 255, 255, 0.1),
                   0 0 0 1px rgba(93, 218, 255, 0.1)
                 `,
                 animationDelay: '1s'
               }}>
            
            {/* 3D GitHub Logo */}
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
                   style={{ 
                     background: 'linear-gradient(135deg, rgb(93, 218, 255) 0%, rgb(0, 184, 212) 100%)',
                     boxShadow: `
                       0 20px 40px rgba(93, 218, 255, 0.3),
                       inset 0 2px 0 rgba(255, 255, 255, 0.3),
                       inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                     `,
                     animation: 'pulse-glow 3s ease-in-out infinite'
                   }}>
                <Github size={40} className="text-white relative z-10" />
                
                {/* 3D depth layers */}
                <div className="absolute inset-1 rounded-2xl bg-gradient-to-t from-black/20 to-white/20"></div>
                <div className="absolute -inset-1 rounded-3xl opacity-50 blur-sm"
                     style={{ background: 'linear-gradient(135deg, rgb(93, 218, 255) 0%, rgb(0, 184, 212) 100%)' }}></div>
              </div>
              
              <h1 className="text-4xl font-bold mb-4"
                  style={{ 
                    background: 'linear-gradient(135deg, rgb(93, 218, 255) 0%, rgb(186, 104, 255) 50%, rgb(255, 99, 164) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px rgba(93, 218, 255, 0.5)'
                  }}>
                Welcome to Git-Sleuth
              </h1>
              <p className="text-gray-400 text-lg">Sign in to access your repositories</p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: GitBranch, value: 'Smart', label: 'Detection', color: 'rgb(255, 202, 40)' },
                { icon: Code, value: 'Auto', label: 'Resolution', color: 'rgb(93, 218, 255)' },
                { icon: Users, value: 'Team', label: 'Collaboration', color: 'rgb(186, 104, 255)' }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="text-center p-4 rounded-xl backdrop-blur-sm border floating-element"
                  style={{
                    background: 'rgba(28, 28, 58, 0.6)',
                    borderColor: 'rgba(60, 70, 100, 0.3)',
                    animationDelay: `${2 + index * 0.5}s`
                  }}
                >
                  <feature.icon size={20} className="mx-auto mb-2" style={{ color: feature.color }} />
                  <div className="text-white font-bold text-sm">{feature.value}</div>
                  <div className="text-gray-400 text-xs">{feature.label}</div>
                </div>
              ))}
            </div>

            {/* GitHub OAuth Button */}
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full py-5 rounded-2xl font-bold text-lg text-white transition-all duration-500 relative overflow-hidden group mb-6"
              style={{
                background: 'linear-gradient(135deg, rgb(93, 218, 255) 0%, rgb(0, 184, 212) 100%)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
              }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-6 h-6 border-3 border-transparent border-b-white rounded-full animate-spin animation-reverse"></div>
                  </div>
                  <span>Connecting to GitHub...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Github size={24} />
                  <span>Continue with GitHub</span>
                </div>
              )}
            </button>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['Merge Conflict Detection', 'AI-Powered Resolution', 'Branch Management', 'Quick Setup'].map((feature, index) => (
                <div
                  key={index}
                  className="px-3 py-1 rounded-full text-xs backdrop-blur-sm border floating-element"
                  style={{
                    background: 'rgba(186, 104, 255, 0.2)',
                    borderColor: 'rgba(186, 104, 255, 0.3)',
                    color: 'rgb(186, 104, 255)',
                    animationDelay: `${3 + index * 0.2}s`
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* 3D Decorative Geometric Shapes - Static */}
          <div className="absolute -top-8 -left-8 w-16 h-16 floating-element" style={{ animationDelay: '0.5s' }}>
            <div className="w-full h-full transform rotate-45 rounded-lg"
                 style={{ 
                   background: 'linear-gradient(135deg, rgb(255, 99, 164) 0%, rgb(219, 39, 119) 100%)',
                   boxShadow: '0 10px 25px rgba(255, 99, 164, 0.4)',
                   filter: 'blur(1px)'
                 }}></div>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-20 h-20 floating-element" style={{ animationDelay: '1.5s' }}>
            <div className="w-full h-full rounded-full"
                 style={{ 
                   background: 'linear-gradient(135deg, rgb(186, 104, 255) 0%, rgb(142, 36, 170) 100%)',
                   boxShadow: '0 12px 30px rgba(186, 104, 255, 0.4)',
                   filter: 'blur(2px)'
                 }}></div>
          </div>

          <div className="absolute top-1/2 -right-12 w-6 h-24 floating-element" style={{ animationDelay: '2.5s' }}>
            <div className="w-full h-full rounded-full transform rotate-12"
                 style={{ 
                   background: 'linear-gradient(to bottom, rgb(93, 218, 255) 0%, rgb(0, 184, 212) 100%)',
                   boxShadow: '0 8px 20px rgba(93, 218, 255, 0.3)',
                   filter: 'blur(1px)'
                 }}></div>
          </div>
        </div>

        {/* Large Background Geometric Shapes - Static */}
        <div className="absolute top-20 right-40 w-64 h-64 opacity-5 floating-element" style={{ animationDelay: '3s' }}>
          <div className="w-full h-full transform rotate-12 rounded-3xl border-4"
               style={{ borderColor: 'rgb(93, 218, 255)' }}></div>
        </div>
        
        <div className="absolute bottom-32 left-32 w-48 h-48 opacity-10 floating-element" style={{ animationDelay: '4s' }}>
          <div className="w-full h-full transform -rotate-12"
               style={{ 
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                 background: 'linear-gradient(135deg, rgb(186, 104, 255) 0%, rgb(142, 36, 170) 100%)'
               }}></div>
        </div>
      </div>
    </>
  );
};

export default GitHubLogin;