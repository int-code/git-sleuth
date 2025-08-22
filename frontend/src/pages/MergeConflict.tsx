import { AlertTriangle, Calendar, CheckCircle, Clock, GitBranch, Users } from "lucide-react";
import { colors, gradients, type repository } from "../components/global_var";
import { useState } from "react";
import { MergeConflictHeader } from "../components/merge_conflict_header.";
import { PullRequest } from "../components/pr";

type ActiveTabProp = {
  activeTab: string;
};


export const MergeConflict = ({ activeTab }: ActiveTabProp) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<repository[]>([]);

  // Filter repositories based on search and conflict status
  const filteredRepositories = data.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'conflicts') {
      // Check if any PR has merge conflicts (mergeable === false)
      return matchesSearch && repo.pull_requests.some(pr => pr.mergeable === false);
    }
    if (filterStatus === 'no-conflicts') {
      // Check if no PRs have merge conflicts
      return matchesSearch && !repo.pull_requests.some(pr => pr.mergeable === false);
    }
    return matchesSearch;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    const url = import.meta.env.VITE_API_URL + "/merge-details";
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  return (
    activeTab == "merge-conflict" &&
    <div style={{ 
      minHeight: '100vh',
      background: colors.background,
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* Header */}
      <MergeConflictHeader 
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        repositories={data}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus} />

      {/* Main Content */}
      <div style={{ padding: '2rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {filteredRepositories.map(repo => (
            <PullRequest key={repo.id} repo={repo} />
          ))}
        </div>

        {filteredRepositories.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: colors.borderLight 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ margin: '0 0 1rem 0', color: colors.primary }}>No repositories found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}