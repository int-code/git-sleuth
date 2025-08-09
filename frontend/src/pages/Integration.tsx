import { Check, ExternalLink, GitBranch, Github, RefreshCw, Settings, Shield, Zap } from "lucide-react";
import { colors, gradients } from "../components/global_var";
import { useState } from "react";

type ActiveTabProp = {
  activeTab: string;
};

export const Integrations = ({ activeTab }: ActiveTabProp) => {
    const [selectedRepo, setSelectedRepo] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    
    const repositories = [
        { name: "awesome-project", owner: "yourorg", connected: true, lastSync: "2 minutes ago" },
        { name: "frontend-app", owner: "yourorg", connected: true, lastSync: "1 hour ago" },
        { name: "backend-api", owner: "yourorg", connected: false, lastSync: "Never" },
        { name: "mobile-app", owner: "yourorg", connected: false, lastSync: "Never" }
    ];

    const handleGitHubIntegration = () => {
        // Redirect to GitHub App installation page
        window.open('https://github.com/apps/your-app-name/installations/new', '_blank');
    };

    const handleManageInstallations = () => {
        // Redirect to GitHub App installations management
        window.open('https://github.com/settings/installations', '_blank');
    };

    return (
        activeTab == "integrations" &&
        <>
        <div style={{ minHeight: '100vh', background: colors.background, padding: '2rem' }}>
            {/* Header */}
            <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        background: gradients.primary,
                        marginRight: '1rem'
                    }}>
                        <Github size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>GitHub Integration</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: colors.borderLight }}>
                            Connect and manage your GitHub repositories seamlessly
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                
                {/* Integration Status */}
                <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Shield size={24} color={colors.primary} style={{ marginRight: '0.5rem' }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Integration Status</h2>
                    </div>
                    
                    <div style={{ 
                        background: gradients.primary, 
                        padding: '1rem', 
                        borderRadius: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>GitHub App Connected</span>
                            <Check size={20} />
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
                            App installed and monitoring repositories
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.primary }}>
                                {repositories.filter(r => r.connected).length}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: colors.borderLight }}>Connected Repos</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.accent }}>
                                24/7
                            </div>
                            <div style={{ fontSize: '0.875rem', color: colors.borderLight }}>Monitoring</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {/* Integration Setup */}
                <div className="gradient-border">
                    <div style={{ 
                        background: gradients.surface,
                        borderRadius: '1rem',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: colors.primary }}>
                            🚀 GitHub App Integration
                        </h3>
                        <p style={{ marginBottom: '1.5rem', color: colors.borderLight }}>
                            Install our GitHub App to automatically connect your repositories. You'll be redirected to GitHub where you can select which repositories to integrate.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={handleGitHubIntegration}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: gradients.primary,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <ExternalLink size={18} />
                                Install GitHub App
                            </button>
                            
                            <button 
                                onClick={handleManageInstallations}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${colors.secondary}`,
                                    background: 'transparent',
                                    color: colors.secondary,
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Settings size={18} />
                                Manage Installations
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repository List */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <GitBranch size={24} color={colors.secondary} style={{ marginRight: '0.5rem' }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Connected Repositories</h2>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: colors.surfaceLight,
                            color: colors.borderLight,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {repositories.map((repo, index) => (
                        <div 
                            key={index}
                            className="shimmer-effect"
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: `1px solid ${colors.border}`,
                                background: colors.surface,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span 
                                    className={`status-indicator ${repo.connected ? 'status-connected' : 'status-disconnected'}`}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                                        {repo.owner}/{repo.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: colors.borderLight }}>
                                        Last sync: {repo.lastSync}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: repo.connected ? gradients.primary : colors.border,
                                    color: 'white'
                                }}>
                                    {repo.connected ? 'Connected' : 'Disconnected'}
                                </span>
                                <button 
                                    onClick={handleManageInstallations}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: colors.surfaceLight,
                                        color: colors.borderLight,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Settings size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}