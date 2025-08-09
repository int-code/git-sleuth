// Mock data for merge conflict resolution trend
export const conflictTrendData = [
{ day: 'Mon', resolved: 12, pending: 3, escalated: 1 },
{ day: 'Tue', resolved: 18, pending: 5, escalated: 2 },
{ day: 'Wed', resolved: 15, pending: 2, escalated: 0 },
{ day: 'Thu', resolved: 22, pending: 4, escalated: 1 },
{ day: 'Fri', resolved: 19, pending: 1, escalated: 0 },
{ day: 'Sat', resolved: 8, pending: 0, escalated: 0 },
{ day: 'Sun', resolved: 6, pending: 1, escalated: 0 }
];

export const weeklyTrendData = [
{ week: 'W1', conflicts: 45, resolved: 42, rate: 93.3 },
{ week: 'W2', conflicts: 52, resolved: 49, rate: 94.2 },
{ week: 'W3', conflicts: 38, resolved: 37, rate: 97.4 },
{ week: 'W4', conflicts: 61, resolved: 58, rate: 95.1 }
];

// Enhanced color scheme with gradients
export const colors = {
  primary: 'rgb(93 218 255)',          // Neon Cyan
  primaryDark: 'rgb(0 184 212)',       // Deeper Cyan
  secondary: 'rgb(186 104 255)',       // Light Purple
  secondaryDark: 'rgb(142 36 170)',    // Deep Purple
  accent: 'rgb(255 99 164)',           // Pink Coral
  accentDark: 'rgb(219 39 119)',       // Hot Pink
  warning: 'rgb(255 202 40)',          // Bright Yellow
  danger: 'rgb(255 71 87)',            // Coral Red
  background: 'rgb(10 10 25)',         // Midnight Navy
  surface: 'rgb(18 18 40)',            // Dark Surface
  surfaceLight: 'rgb(28 28 58)',       // Slightly Lighter Surface
  border: 'rgb(60 70 100)',            // Slate Blue
  borderLight: 'rgb(80 90 120)'        // Soft Slate
};

export const gradients = {
primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
secondary: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryDark} 100%)`,
accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
surface: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%)`
};


export interface pullRequest {
    id: number;
    title: string;
    author: string;
    branch: string;
    targetBranch: string;
    status: string;
    hasConflict: boolean;
    conflictResolution: string | null;
    createdAt: string;
    updatedAt: string;
    conflictFiles: string[];
    reviewers: string[];
    assignee: string;
}

export interface repository {
    id: number
    name: string;
    owner: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    lastUpdate: string;
    pullRequests: Array<pullRequest>
}
