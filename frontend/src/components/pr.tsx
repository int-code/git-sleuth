import { AlertTriangle, Calendar, CheckCircle, Clock, GitBranch, Users, ChevronRight } from "lucide-react"
import { useState } from "react"
import { colors, gradients, type repository } from "./global_var"

interface Props {
    repo: repository;
}

export const PullRequest = ({ repo }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    const getConflictStatusIcon = (resolution: string| null) => {
        switch (resolution) {
        case 'resolved': return <CheckCircle size={16} />;
        case 'in-progress': return <Clock size={16} />;
        case 'pending': return <AlertTriangle size={16} />;
        default: return <GitBranch size={16} />;
        }
    };

    const getConflictStatusColor = (resolution: string | null) => {
        switch (resolution) {
        case 'resolved': return colors.primary;
        case 'in-progress': return colors.warning;
        case 'pending': return colors.danger;
        default: return colors.borderLight;
        }
    };

    const handleRepoClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div key={repo.id} className="dashboard-card shimmer-effect"  onClick={handleRepoClick}>
            {/* Repository Header - Always Visible */}
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: isExpanded ? '1.5rem' : '0',
                    cursor: 'pointer',
                    padding: isExpanded ? '0' : '0.5rem 0'
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: '1.5rem', 
                            color: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <GitBranch size={24} />
                            {repo.owner}/{repo.name}
                        </h2>
                        <span style={{
                            background: gradients.secondary,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            {repo.language}
                        </span>
                        <ChevronRight 
                            size={20} 
                            style={{ 
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                color: colors.borderLight
                            }} 
                        />
                    </div>
                    <p style={{ color: colors.borderLight, margin: '0 0 1rem 0' }}>
                        {repo.description}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: colors.borderLight }}>
                        <span>★ {repo.stars}</span>
                        <span>⑂ {repo.forks}</span>
                        <span>Updated {formatDate(repo.lastUpdate)}</span>
                    </div>
                </div>
                <div style={{ 
                    background: repo.pullRequests.some(pr => pr.hasConflict) ? 
                    `rgba(${colors.danger.replace('rgb(', '').replace(')', '')}, 0.2)` : 
                    `rgba(${colors.primary.replace('rgb(', '').replace(')', '')}, 0.2)`,
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${repo.pullRequests.some(pr => pr.hasConflict) ? colors.danger : colors.primary}`,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {repo.pullRequests.filter(pr => pr.hasConflict).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Conflicts</div>
                </div>
            </div>

            {/* Pull Requests - Only Visible When Expanded */}
            {isExpanded && (
                <div style={{ 
                    marginTop: '1rem',
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: '1rem',
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    {repo.pullRequests.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <h3 style={{ 
                                margin: 0, 
                                color: colors.secondary, 
                                borderBottom: `1px solid ${colors.border}`, 
                                paddingBottom: '0.5rem' 
                            }}>
                                Pull Requests ({repo.pullRequests.length})
                            </h3>
                            {repo.pullRequests.map(pr => (
                                <div key={pr.id} style={{
                                    background: pr.hasConflict ? 
                                    `rgba(${colors.danger.replace('rgb(', '').replace(')', '')}, 0.1)` : 
                                    `rgba(${colors.surface.replace('rgb(', '').replace(')', '')}, 0.5)`,
                                    border: `1px solid ${pr.hasConflict ? colors.danger : colors.border}`,
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>
                                                #{pr.id} {pr.title}
                                            </h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: colors.borderLight, marginBottom: '0.75rem' }}>
                                                <span>by {pr.author}</span>
                                                <span>{pr.branch} → {pr.targetBranch}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={14} />
                                                    {formatDate(pr.createdAt)}
                                                </span>
                                            </div>
                                            {pr.reviewers.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: colors.borderLight }}>
                                                    <Users size={14} />
                                                    Reviewers: {pr.reviewers.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {pr.hasConflict && (
                                            <div style={{
                                                background: `rgba(${getConflictStatusColor(pr.conflictResolution).replace('rgb(', '').replace(')', '')}, 0.2)`,
                                                border: `1px solid ${getConflictStatusColor(pr.conflictResolution)}`,
                                                borderRadius: '0.75rem',
                                                padding: '0.5rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: getConflictStatusColor(pr.conflictResolution)
                                            }}>
                                                {getConflictStatusIcon(pr.conflictResolution)}
                                                <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                                                    {pr.conflictResolution || 'No Conflict'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {pr.hasConflict && pr.conflictFiles.length > 0 && (
                                        <div style={{ 
                                            background: `rgba(${colors.danger.replace('rgb(', '').replace(')', '')}, 0.1)`,
                                            borderRadius: '0.5rem',
                                            padding: '1rem',
                                            marginTop: '1rem'
                                        }}>
                                            <div style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: '600', 
                                                color: colors.danger, 
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <AlertTriangle size={16} />
                                                Conflicted Files ({pr.conflictFiles.length})
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {pr.conflictFiles.map((file, index) => (
                                                    <span key={index} style={{
                                                        background: colors.surface,
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.8rem',
                                                        color: colors.borderLight,
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        {file}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '2rem', 
                            color: colors.borderLight,
                            background: `rgba(${colors.surface.replace('rgb(', '').replace(')', '')}, 0.5)`,
                            borderRadius: '0.75rem'
                        }}>
                            No pull requests found
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}