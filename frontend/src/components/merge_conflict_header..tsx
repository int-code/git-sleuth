import { RefreshCw, Search } from "lucide-react"
import { colors, gradients } from "./global_var"
import type { repository } from "./global_var";


interface HeaderProps {
    handleRefresh: () => void;
    isRefreshing: boolean;
    repositories: Array<repository>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    filterStatus: string;
    setFilterStatus: React.Dispatch<React.SetStateAction<string>>;

}
export const MergeConflictHeader = ({ handleRefresh,
                                    isRefreshing, 
                                    repositories, 
                                    searchTerm, 
                                    setSearchTerm,
                                    filterStatus,
                                    setFilterStatus}: HeaderProps) =>{
    const getTotalConflicts = () => {
        return repositories.reduce((total, repo) => {
        return total + repo.pull_requests.filter(pr => pr.mergeable).length;
        }, 0);
    };
    const getResolvedConflicts = () => {
    return repositories.reduce((total, repo) => {
      return total + repo.pull_requests.filter(pr => pr.mergeable).length;
    }, 0);
  };
    return (
        <div style={{ 
        padding: '2rem',
        background: gradients.surface,
        borderBottom: `1px solid ${colors.border}`,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2.5rem', 
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                Merge Conflict Dashboard
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: colors.borderLight, fontSize: '1.1rem' }}>
                Monitor and resolve merge conflicts across all repositories
              </p>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                background: gradients.primary,
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                transform: isRefreshing ? 'scale(0.95)' : 'scale(1)'
              }}
            >
              <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.primary }}>
                {repositories.length}
              </div>
              <div style={{ color: colors.borderLight }}>Total Repositories</div>
            </div>
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.danger }}>
                {getTotalConflicts()}
              </div>
              <div style={{ color: colors.borderLight }}>Active Conflicts</div>
            </div>
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.warning }}>
                {repositories.reduce((total, repo) => total + repo.pull_requests.length, 0)}
              </div>
              <div style={{ color: colors.borderLight }}>Total Pull Requests</div>
            </div>
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.primary }}>
                {getResolvedConflicts()}
              </div>
              <div style={{ color: colors.borderLight }}>Resolved Conflicts</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: colors.borderLight 
              }} />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Repositories</option>
              <option value="conflicts">With Conflicts</option>
              <option value="no-conflicts">No Conflicts</option>
            </select>
          </div>
        </div>
      </div>
    )
}