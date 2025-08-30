import { AlertTriangle, Calendar, CheckCircle, Clock, GitBranch, ChevronRight } from "lucide-react"
import { useState } from "react"
import { colors, gradients } from "./global_var"
import type { repository } from "./global_var"

interface Props {
    repo: repository;
}

export const PullRequest = ({ repo }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConflictStatusIcon = (mergeable: boolean | null) => {
        if (mergeable === false) return <AlertTriangle size={16} />;
        if (mergeable === true) return <CheckCircle size={16} />;
        return <Clock size={16} />;
    };

    const getConflictStatusColor = (mergeable: boolean | null) => {
        if (mergeable === false) return colors.danger;
        if (mergeable === true) return colors.primary;
        return colors.warning;
    };

    const getConflictStatusText = (mergeable: boolean | null) => {
        if (mergeable === false) return 'Has Conflicts';
        if (mergeable === true) return 'No Conflicts';
        return 'Unknown';
    };

    const handleRepoClick = () => {
        setIsExpanded(!isExpanded);
    };

    // Extract owner and repo name from full_name
    // const [owner, repoName] = repo.full_name.split('/');
    const conflictCount = repo.pull_requests.filter(pr => pr.mergeable === false).length;

    return (
        <div key={repo.id} className="dashboard-card shimmer-effect" onClick={handleRepoClick}>
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
                            {repo.full_name}
                        </h2>
                        <span style={{
                            background: gradients.secondary,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            {repo.private ? 'Private' : 'Public'}
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
                        Status: {repo.status} • Created {formatDate(new Date(repo.created_at))}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: colors.borderLight }}>
                        <span>📋 {repo.pull_requests.length} PRs</span>
                        <span>🔗 ID: {repo.github_id}</span>
                        <span>Updated {formatDate(new Date(repo.created_at))}</span>
                    </div>
                </div>
                <div style={{ 
                    background: conflictCount > 0 ? 
                    `rgba(${colors.danger.replace('rgb(', '').replace(')', '')}, 0.2)` : 
                    `rgba(${colors.primary.replace('rgb(', '').replace(')', '')}, 0.2)`,
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${conflictCount > 0 ? colors.danger : colors.primary}`,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {conflictCount}
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
                    {repo.pull_requests.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <h3 style={{ 
                                margin: 0, 
                                color: colors.secondary, 
                                borderBottom: `1px solid ${colors.border}`, 
                                paddingBottom: '0.5rem' 
                            }}>
                                Pull Requests ({repo.pull_requests.length})
                            </h3>
                            {repo.pull_requests.map(pr => (
                                <div key={pr.id} style={{
                                    background: pr.mergeable === false ? 
                                    `rgba(${colors.danger.replace('rgb(', '').replace(')', '')}, 0.1)` : 
                                    `rgba(${colors.surface.replace('rgb(', '').replace(')', '')}, 0.5)`,
                                    border: `1px solid ${pr.mergeable === false ? colors.danger : colors.border}`,
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>
                                                #{pr.pr_number} {pr.title}
                                            </h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: colors.borderLight, marginBottom: '0.75rem' }}>
                                                <span>State: {pr.state}</span>
                                                <span>Commits: {pr.commits}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={14} />
                                                    {formatDate(new Date(pr.created_at))}
                                                </span>
                                            </div>
                                            {/* {pr.details && (
                                                <p style={{ 
                                                    fontSize: '0.9rem', 
                                                    color: colors.borderLight, 
                                                    margin: '0.5rem 0',
                                                    fontStyle: 'italic'
                                                }}>
                                                    {pr.details}
                                                </p>
                                            )} */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: colors.borderLight }}>
                                                <a 
                                                    href={pr.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                        color: colors.primary, 
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <GitBranch size={14} />
                                                    View on GitHub
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            background: `rgba(${getConflictStatusColor(pr.mergeable).replace('rgb(', '').replace(')', '')}, 0.2)`,
                                            border: `1px solid ${getConflictStatusColor(pr.mergeable)}`,
                                            borderRadius: '0.75rem',
                                            padding: '0.5rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: getConflictStatusColor(pr.mergeable)
                                        }}>
                                            {getConflictStatusIcon(pr.mergeable)}
                                            <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                                                {getConflictStatusText(pr.mergeable)}
                                            </span>
                                        </div>
                                    </div>

                                    {pr.mergeable === false && (
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
                                                Merge Conflict Detected
                                            </div>
                                            <p style={{ 
                                                fontSize: '0.9rem', 
                                                color: colors.borderLight, 
                                                margin: '0',
                                                lineHeight: '1.4'
                                            }}>
                                                This pull request has merge conflicts that need to be resolved before it can be merged.
                                            </p>
                                        </div>
                                    )}

                                    {pr.closed_at && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            fontSize: '0.9rem',
                                            color: colors.borderLight,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Clock size={14} />
                                            Closed: {formatDate(new Date(pr.closed_at))}
                                        </div>
                                    )}

                                    {pr.merged_at && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            fontSize: '0.9rem',
                                            color: colors.primary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <CheckCircle size={14} />
                                            Merged: {formatDate(new Date(pr.merged_at))}
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}