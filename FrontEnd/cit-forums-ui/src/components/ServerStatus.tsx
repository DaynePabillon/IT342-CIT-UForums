import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';

interface ServerStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Health check endpoint - can be a simple endpoint that doesn't require auth
  const HEALTH_CHECK_URL = '/api/admin/monitor/health';

  const checkServerStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      console.log('Checking server health...');
      // Use a short timeout for health checks
      const response = await axiosInstance.get(HEALTH_CHECK_URL, {
        timeout: 5000, // Override the default timeout
      });
      
      const serverIsOnline = response.status === 200;
      console.log('Server is', serverIsOnline ? 'online' : 'offline');
      
      setIsOnline(serverIsOnline);
      setLastChecked(new Date());
      
      if (onStatusChange) {
        onStatusChange(serverIsOnline);
      }
    } catch (error) {
      console.error('Server health check failed:', error);
      setIsOnline(false);
      
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Check status when component mounts
  useEffect(() => {
    checkServerStatus();
    
    // Set up periodic health checks
    const intervalId = setInterval(checkServerStatus, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const renderStatus = () => {
    if (isOnline === null) {
      return <span className="badge bg-secondary">Checking...</span>;
    } else if (isOnline) {
      return <span className="badge bg-success">Online</span>;
    } else {
      return <span className="badge bg-danger">Offline</span>;
    }
  };

  return (
    <div className="server-status">
      <div className="d-flex align-items-center">
        <span className="me-2">Server Status:</span>
        {renderStatus()}
        {lastChecked && (
          <small className="text-muted ms-2">
            Last checked: {lastChecked.toLocaleTimeString()}
          </small>
        )}
        <button 
          className="btn btn-sm btn-outline-secondary ms-2" 
          onClick={checkServerStatus}
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Check Now'}
        </button>
      </div>
      {!isOnline && isOnline !== null && (
        <div className="alert alert-warning mt-2">
          <p>The server appears to be offline or unreachable. This may cause loading issues.</p>
          <p className="mb-0">Please ensure the backend server is running and try again.</p>
        </div>
      )}
    </div>
  );
};

export default ServerStatus; 