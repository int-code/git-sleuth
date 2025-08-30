import { 
  FiUser, FiGitMerge,
  FiCpu, FiDatabase,
  FiHome,
} from 'react-icons/fi';
import React, { useEffect, useState } from 'react';
import { colors, gradients } from './global_var'

type NavigationProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "Loading ...",
        email: "Loading ...",
        avatarUrl: ""
    });

    useEffect(() => {
        // Fetch user profile data from backend
        const token = sessionStorage.getItem("token");
        if (!token) return;
        fetch(import.meta.env.VITE_API_URL + "/user", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            setProfileData({
                name: data.name || "Unknown User",
                email: data.email || "No Email",
                avatarUrl: data.avatar_url || ""
            });
        });
    }, []);

    const handleManageInstallations = () => {
        const url = import.meta.env.VITE_API_URL + "/install-app";
        // Navigate the browser, including the JWT token
        window.location.href = url + `?token=${sessionStorage.getItem("token")}`;
    };
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.href = '/login'; // Redirect to login page or homepage
    };
  
    return (
    <nav className="sticky top-0 z-50" style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(15, 23, 35, 0.8)',
        borderBottom: `1px solid rgba(99, 102, 241, 0.2)`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
    }}>
        <div className="px-8 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-4">
            <div className="relative">
                <FiGitMerge style={{ 
                color: colors.primary,
                filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))'
                }} size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{
                background: gradients.accent,
                animation: 'pulse 2s infinite'
                }}></div>
            </div>
            <div>
                <span style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1.5px'
                }}>
                git-sleuth<span style={{ fontWeight: 400, opacity: 0.8 }}>AI</span>
                </span>
                <div style={{
                fontSize: '0.7rem',
                color: 'rgba(220, 225, 235, 0.6)',
                letterSpacing: '2px',
                fontWeight: 500
                }}>AUTONOMOUS MERGE DETECTIVE</div>
            </div>
            </div>

            <div className="flex items-center space-x-2">
            {[
                { id: 'agent-logs', icon: <FiCpu />, label: 'AI Logs', status: 'disabled'},
                { id: 'home', icon: <FiHome />, label: 'Home'},
                { id: 'merge-conflict', icon: <FiGitMerge />, label: 'Merge Intel' },  
                // { id: 'integrations', icon: <FiDatabase />, label: 'Integrations' }
            ].map(tab => (
                <button
                key={tab.id}
                className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center transition-all duration-500 ${"status" in tab ? 'cursor-not-allowed opacity-50' : 'hover:translate-y-[-1px]'}`}
                onClick={() => {
                    if("status" in tab) return;
                    setActiveTab(tab.id);}}
                title={"status" in tab? "🚧 Coming Soon" : ""}
                style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(220, 225, 235, 0.7)',
                    background: activeTab === tab.id ? gradients.primary : 'transparent',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${activeTab === tab.id ? 'rgba(99, 102, 241, 0.3)' : 'transparent'}`,
                    boxShadow: activeTab === tab.id ? '0 8px 25px rgba(99, 102, 241, 0.3)' : 'none',
                    transform: activeTab === tab.id ? 'translateY(-1px)' : 'none'
                }}
                onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    }
                }}
                >
                {React.cloneElement(tab.icon, { className: 'mr-2', size: 16 })}
                <span>{tab.label}</span>
                </button>
            ))}
                {/* Profile Avatar */}
                <div className="relative ml-4">
                    <button
                    onClick={() => setShowProfileDropdown(prev => !prev)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md hover:shadow-lg transition"
                    title="User Profile"
                    >
                        {profileData.avatarUrl =='' ? <FiUser size={18} color="white" />: <img src={profileData.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />}
                    
                    </button>

                    {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#101928] rounded-lg shadow-lg py-3 px-4 text-sm text-gray-200 z-50 border border-[#2a2f3c]">
                        <div className="font-semibold text-white mb-2">{profileData.name}</div>
                        <div className="text-xs mb-4 text-gray-400">{profileData.email}</div>
                        <hr className="border-gray-600 mb-3" />
                        <button className="w-full text-left text-gray-300 hover:text-white py-1 cursor-pointer" onClick={handleManageInstallations}>Manage Installations</button>
                        <button className="w-full text-left text-gray-300 hover:text-white py-1 cursor-pointer" onClick={handleLogout}>Logout</button>
                    </div>
                    )}
                </div>
            </div>
        </div>
        </nav>
  );
};