import { AlertTriangle, Calendar, CheckCircle, Clock, GitBranch, Users } from "lucide-react";
import { colors, gradients } from "../components/global_var";
import { useState } from "react";
import { MergeConflictHeader } from "../components/merge_conflict_header.";
import { PullRequest } from "../components/pr";

type ActiveTabProp = {
  activeTab: string;
};


const mockData = {
  repositories: [
    {
      id: 1,
      name: 'frontend-webapp',
      owner: 'techcorp',
      description: 'Main frontend application with React and TypeScript',
      language: 'TypeScript',
      stars: 234,
      forks: 45,
      lastUpdate: '2024-08-01T10:30:00Z',
      pullRequests: [
        {
          id: 101,
          title: 'Add user authentication system',
          author: 'john.doe',
          branch: 'feature/auth-system',
          targetBranch: 'main',
          status: 'open',
          hasConflict: true,
          conflictResolution: 'pending',
          createdAt: '2024-07-30T14:20:00Z',
          updatedAt: '2024-08-01T09:15:00Z',
          conflictFiles: ['src/auth/login.tsx', 'src/components/Header.tsx'],
          reviewers: ['jane.smith', 'bob.wilson'],
          assignee: 'john.doe'
        },
        {
          id: 102,
          title: 'Update dashboard layout',
          author: 'jane.smith',
          branch: 'ui/dashboard-redesign',
          targetBranch: 'main',
          status: 'open',
          hasConflict: false,
          conflictResolution: null,
          createdAt: '2024-07-29T11:45:00Z',
          updatedAt: '2024-07-31T16:30:00Z',
          conflictFiles: [],
          reviewers: ['john.doe'],
          assignee: 'jane.smith'
        }
      ]
    },
    {
      id: 2,
      name: 'backend-api',
      owner: 'techcorp',
      description: 'RESTful API backend service built with Node.js',
      language: 'JavaScript',
      stars: 189,
      forks: 32,
      lastUpdate: '2024-07-31T16:45:00Z',
      pullRequests: [
        {
          id: 201,
          title: 'Implement rate limiting middleware',
          author: 'bob.wilson',
          branch: 'feature/rate-limiting',
          targetBranch: 'develop',
          status: 'open',
          hasConflict: true,
          conflictResolution: 'in-progress',
          createdAt: '2024-07-28T13:10:00Z',
          updatedAt: '2024-07-31T14:20:00Z',
          conflictFiles: ['middleware/auth.js', 'routes/api.js', 'package.json'],
          reviewers: ['alice.brown', 'john.doe'],
          assignee: 'bob.wilson'
        },
        {
          id: 202,
          title: 'Fix database connection pool',
          author: 'alice.brown',
          branch: 'bugfix/db-connection',
          targetBranch: 'main',
          status: 'open',
          hasConflict: true,
          conflictResolution: 'resolved',
          createdAt: '2024-07-27T09:30:00Z',
          updatedAt: '2024-08-01T08:45:00Z',
          conflictFiles: ['config/database.js'],
          reviewers: ['bob.wilson'],
          assignee: 'alice.brown'
        }
      ]
    },
    {
      id: 3,
      name: 'mobile-app',
      owner: 'techcorp',
      description: 'Cross-platform mobile application using React Native',
      language: 'TypeScript',
      stars: 156,
      forks: 28,
      lastUpdate: '2024-08-01T12:15:00Z',
      pullRequests: [
        {
          id: 301,
          title: 'Add push notification support',
          author: 'carol.davis',
          branch: 'feature/push-notifications',
          targetBranch: 'main',
          status: 'open',
          hasConflict: false,
          conflictResolution: null,
          createdAt: '2024-07-30T10:20:00Z',
          updatedAt: '2024-08-01T11:30:00Z',
          conflictFiles: [],
          reviewers: ['david.lee'],
          assignee: 'carol.davis'
        }
      ]
    }
  ]
};

export const MergeConflict = ({ activeTab }: ActiveTabProp) => {

  const [repositories, setRepositories] = useState(mockData.repositories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter repositories based on search and conflict status
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'conflicts') {
      return matchesSearch && repo.pullRequests.some(pr => pr.hasConflict);
    }
    if (filterStatus === 'no-conflicts') {
      return matchesSearch && !repo.pullRequests.some(pr => pr.hasConflict);
    }
    return matchesSearch;
  });

  

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
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
      < MergeConflictHeader 
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        repositories={repositories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus} />


      {/* Main Content */}
      <div style={{ padding: '2rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {filteredRepositories.map(repo => (
            <PullRequest repo={repo} />
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