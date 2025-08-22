import { useEffect, useState } from "react";
import { gradients, colors, type dataInterface } from "./global_var"
import { BsFillLightningFill } from 'react-icons/bs';
import { 
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';

type StatusbarProps = {
    data: dataInterface;
    setData: (data: dataInterface) => void
}

export const Statusbar = ({data, setData}: StatusbarProps) => {
    const [pulse, setPulse] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastSet, setLastSet] = useState<Date | null>(null);
    
    // Animation pulse for realtime indicator
    useEffect(() => {
        const interval = setInterval(() => {
          setPulse(v => !v);
        }, 2000);
        handleSync();
        return () => clearInterval(interval);
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        const url = import.meta.env.VITE_API_URL + '/dashboard';
        const token = sessionStorage.getItem('token');
        const refreshed_data = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }})
        if (refreshed_data.status == 401) {
            alert("Session expired. Please log in again.");
            sessionStorage.removeItem('token');
            window.location.href = '/';
            return;
        }
        const data = await refreshed_data.json();
        setData(data);
        setLastSet(new Date());
        setSyncing(false);
    };

    return (
        <div className="mx-8 mt-6 mb-8 rounded-2xl" style={{
            background: gradients.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 30px rgba(99, 102, 241, ${pulse ? 0.2 : 0.1}), 0 8px 25px rgba(0, 0, 0, 0.3)`,
            transition: 'all 1s ease',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="px-8 py-4 flex justify-between items-center text-sm">
                <div className="flex items-center space-x-8">
                <div className="flex items-center">
                    <div className="relative mr-3">
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: gradients.accent,
                        boxShadow: `0 0 20px ${colors.accent}, 0 0 40px ${colors.accent}`,
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <div className="absolute inset-0 rounded-full animate-ping" style={{
                        backgroundColor: colors.accent,
                        opacity: 0.3
                    }}></div>
                    </div>
                    <span style={{ fontWeight: 600, letterSpacing: '1px' }}>SYSTEMS OPERATIONAL</span>
                </div>
                <div className="flex items-center" style={{ color: colors.primary }}>
                    <BsFillLightningFill className="mr-2" />
                    <span style={{ fontWeight: 600 }}>REALTIME PROCESSING</span>
                </div>
                {/* <div className="flex items-center" style={{ color: colors.secondary }}>
                    <FiActivity className="mr-2" />
                    <span>42 ACTIVE MONITORS</span>
                </div> */}
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center px-3 py-1 rounded-lg transition-all duration-200 hover:opacity-80"
                        style={{
                            background: syncing ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                            border: `1px solid ${colors.accent}`,
                            color: colors.accent,
                            cursor: syncing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <FiRefreshCw 
                            className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                            style={{ fontSize: '14px' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>
                            {syncing ? 'SYNCING...' : 'SYNC'}
                        </span>
                    </button>
                    <div style={{ color: 'rgba(220, 225, 235, 0.7)' }}>
                        Last sync: <span style={{ 
                            color: colors.accent, 
                            fontWeight: 600,
                            textShadow: `0 0 10px ${colors.accent}`
                        }}>
                            {lastSet
                            ? (() => {
                                const diff = (Date.now() - lastSet.getTime()) / 1000;
                                if (diff < 1) return "NOW";
                                if (diff < 60) return `${Math.floor(diff)}s ago`;
                                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                                return `${Math.floor(diff / 3600)}h ago`;
                            })()
                            : "Never"
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}