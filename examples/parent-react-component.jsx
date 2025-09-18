import React, { useState, useRef, useEffect, useCallback } from 'react';
import './VehicleDashboard.css'; // You'll need to create this CSS file

const VehicleDashboard = () => {
  // Configuration
  const iframeUrl = 'http://localhost:8080'; // Update this to your iframe URL
  const isDevelopment = process.env.NODE_ENV === 'development';

  // State
  const [isIframeConnected, setIsIframeConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(''); 
  const [selectedGroup, setSelectedGroup] = useState('');
  const [messageLog, setMessageLog] = useState([]);
  const [iframeStats, setIframeStats] = useState(null);
  
  // Refs
  const iframeRef = useRef(null);

  // Available groups - in production, fetch this from your API
  const availableGroups = [
    { code: 'FLEET_001', name: 'Main Fleet' },
    { code: 'FLEET_002', name: 'Delivery Vehicles' },
    { code: 'FLEET_003', name: 'Emergency Vehicles' }
  ];

  // Utility functions
  const logMessage = useCallback((direction, type, data) => {
    setMessageLog(prevLog => {
      const newMessage = {
        timestamp: new Date(),
        direction,
        type,
        data
      };
      const updatedLog = [newMessage, ...prevLog];
      // Keep only last 50 messages
      return updatedLog.slice(0, 50);
    });
  }, []);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString();
  };

  // Core functions
  const sendCredentials = useCallback(() => {
    if (!iframeRef.current?.contentWindow) {
      console.warn('Iframe not ready');
      return;
    }

    // Send token
    if (accessToken) {
      const tokenMessage = {
        type: 'GPS_SET_TOKEN',
        payload: { token: accessToken }
      };
      iframeRef.current.contentWindow.postMessage(tokenMessage, '*');
      logMessage('parent->iframe', 'GPS_SET_TOKEN', { token: '[HIDDEN]' });
    }

    // Send group code
    if (selectedGroup) {
      const groupMessage = {
        type: 'GPS_SET_GROUP',
        payload: { groupCode: selectedGroup }
      };
      iframeRef.current.contentWindow.postMessage(groupMessage, '*');
      logMessage('parent->iframe', 'GPS_SET_GROUP', groupMessage);
    }

    setIsIframeConnected(true);
  }, [accessToken, selectedGroup, logMessage]);

  const handleIframeLoad = () => {
    console.log('GPS iframe loaded');
    logMessage('iframe', 'IFRAME_LOADED', {});
    
    // Give iframe a moment to initialize then send credentials
    setTimeout(() => {
      if (accessToken && selectedGroup) {
        sendCredentials();
      }
    }, 1000);
  };

  const refreshIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setIsIframeConnected(false);
    }
  };

  // Event handlers
  const handleTokenChange = (e) => {
    setAccessToken(e.target.value);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const updateToken = () => {
    if (isIframeConnected && accessToken) {
      const message = {
        type: 'GPS_SET_TOKEN',
        payload: { token: accessToken }
      };
      iframeRef.current.contentWindow.postMessage(message, '*');
      logMessage('parent->iframe', 'GPS_SET_TOKEN', { token: '[HIDDEN]' });
    }
  };

  const updateGroup = () => {
    if (isIframeConnected && selectedGroup) {
      const message = {
        type: 'GPS_SET_GROUP',
        payload: { groupCode: selectedGroup }
      };
      iframeRef.current.contentWindow.postMessage(message, '*');
      logMessage('parent->iframe', 'GPS_SET_GROUP', message);
    }
  };

  // Message handler for iframe communication
  const handleMessage = useCallback((event) => {
    // Security: In production, validate event.origin
    // if (event.origin !== 'https://your-trusted-domain.com') return;
    
    logMessage('iframe->parent', event.data.type, event.data);
    
    switch (event.data.type) {
      case 'GPS_REQUEST_TOKEN':
        if (accessToken) {
          event.source.postMessage({
            type: 'GPS_SET_TOKEN',
            payload: { token: accessToken }
          }, '*');
          logMessage('parent->iframe', 'GPS_SET_TOKEN', { token: '[HIDDEN]' });
        }
        break;
        
      case 'GPS_REQUEST_GROUP':
        if (selectedGroup) {
          event.source.postMessage({
            type: 'GPS_SET_GROUP',
            payload: { groupCode: selectedGroup }
          }, '*');
          logMessage('parent->iframe', 'GPS_SET_GROUP', { groupCode: selectedGroup });
        }
        break;
        
      case 'GPS_IFRAME_READY':
        console.log('GPS iframe is ready');
        setIsIframeConnected(true);
        if (accessToken && selectedGroup) {
          sendCredentials();
        }
        break;
        
      case 'GPS_STATS_UPDATE':
        setIframeStats(event.data.payload);
        break;
        
      case 'GPS_ERROR':
        console.error('GPS iframe error:', event.data.payload);
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }, [accessToken, selectedGroup, logMessage, sendCredentials]);

  // Effects
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // Update iframe when credentials change
  useEffect(() => {
    if (isIframeConnected && accessToken && selectedGroup) {
      sendCredentials();
    }
  }, [accessToken, selectedGroup, isIframeConnected, sendCredentials]);

  // Load credentials in production
  useEffect(() => {
    if (!isDevelopment) {
      // In production, you might want to load these from your API/auth system
      // Example:
      // loadTokenFromAuth().then(setAccessToken);
      // loadDefaultGroup().then(setSelectedGroup);
    }
  }, [isDevelopment]);

  const canSendCredentials = accessToken && selectedGroup;

  return (
    <div className="gps-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>GPS Vehicle Tracking Dashboard</h1>
        <div className="header-controls">
          <div className={`status-indicator ${isIframeConnected ? 'connected' : ''}`}>
            {isIframeConnected ? 'Connected' : 'Connecting...'}
          </div>
          <button onClick={refreshIframe} className="refresh-btn">
            <RefreshIcon className="icon" />
            Refresh
          </button>
        </div>
      </header>

      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="control-group">
          <label htmlFor="groupSelect">Vehicle Group:</label>
          <select 
            id="groupSelect"
            value={selectedGroup} 
            onChange={handleGroupChange}
            className="group-select"
          >
            <option value="">Select Group</option>
            {availableGroups.map(group => (
              <option key={group.code} value={group.code}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="tokenInput">Access Token:</label>
          <input 
            id="tokenInput"
            value={accessToken}
            onChange={handleTokenChange}
            type="password"
            placeholder="Enter GPS API token"
            className="token-input"
          />
        </div>

        <div className="control-group">
          <button 
            onClick={sendCredentials} 
            className="send-btn" 
            disabled={!canSendCredentials}
          >
            Send Credentials
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {iframeStats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Active Vehicles:</span>
            <span className="stat-value">{iframeStats.activeVehicles || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Update:</span>
            <span className="stat-value">{formatTime(iframeStats.lastUpdate)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className={`stat-value ${iframeStats.status}`}>
              {iframeStats.status || 'Unknown'}
            </span>
          </div>
        </div>
      )}

      {/* GPS Tracker Iframe */}
      <div className="iframe-container">
        <iframe 
          ref={iframeRef}
          src={iframeUrl}
          onLoad={handleIframeLoad}
          className="gps-iframe"
          title="GPS Vehicle Tracker"
        />
        
        {/* Loading overlay */}
        {!isIframeConnected && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading GPS tracker...</p>
          </div>
        )}
      </div>

      {/* Message Log (Development Only) */}
      {isDevelopment && (
        <div className="message-log">
          <h3>Message Log</h3>
          <div className="log-messages">
            {messageLog.map((message, index) => (
              <div 
                key={index}
                className={`log-message ${message.direction.replace('->', '-')}`}
              >
                <span className="timestamp">{formatTime(message.timestamp)}</span>
                <span className="direction">{message.direction}</span>
                <span className="content">{JSON.stringify(message.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple RefreshIcon component (you can replace with your icon library)
const RefreshIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
  </svg>
);

export default VehicleDashboard;
