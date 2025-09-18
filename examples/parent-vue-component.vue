<template>
  <div class="gps-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>GPS Vehicle Tracking Dashboard</h1>
      <div class="header-controls">
        <div class="status-indicator" :class="{ connected: isIframeConnected }">
          {{ isIframeConnected ? 'Connected' : 'Connecting...' }}
        </div>
        <button @click="refreshIframe" class="refresh-btn">
          <RefreshIcon class="icon" />
          Refresh
        </button>
      </div>
    </header>

    <!-- Controls Panel -->
    <div class="controls-panel">
      <div class="control-group">
        <label for="groupSelect">Vehicle Group:</label>
        <select 
          id="groupSelect"
          v-model="selectedGroup" 
          @change="updateGroup"
          class="group-select"
        >
          <option value="">Select Group</option>
          <option v-for="group in availableGroups" :key="group.code" :value="group.code">
            {{ group.name }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="tokenInput">Access Token:</label>
        <input 
          id="tokenInput"
          v-model="accessToken"
          type="password"
          placeholder="Enter GPS API token"
          class="token-input"
          @change="updateToken"
        />
      </div>

      <div class="control-group">
        <button @click="sendCredentials" class="send-btn" :disabled="!accessToken || !selectedGroup">
          Send Credentials
        </button>
      </div>
    </div>

    <!-- Statistics Panel -->
    <div class="stats-panel" v-if="iframeStats">
      <div class="stat-item">
        <span class="stat-label">Active Vehicles:</span>
        <span class="stat-value">{{ iframeStats.activeVehicles || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Last Update:</span>
        <span class="stat-value">{{ formatTime(iframeStats.lastUpdate) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Status:</span>
        <span class="stat-value" :class="iframeStats.status">{{ iframeStats.status || 'Unknown' }}</span>
      </div>
    </div>

    <!-- GPS Tracker Iframe -->
    <div class="iframe-container">
      <iframe 
        ref="gpsIframe"
        :src="iframeUrl"
        @load="handleIframeLoad"
        class="gps-iframe"
        title="GPS Vehicle Tracker"
      ></iframe>
      
      <!-- Loading overlay -->
      <div v-if="!isIframeConnected" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading GPS tracker...</p>
      </div>
    </div>

    <!-- Message Log (Development Only) -->
    <div v-if="isDevelopment" class="message-log">
      <h3>Message Log</h3>
      <div class="log-messages">
        <div 
          v-for="(message, index) in messageLog" 
          :key="index"
          class="log-message"
          :class="message.type"
        >
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          <span class="direction">{{ message.direction }}</span>
          <span class="content">{{ JSON.stringify(message.data) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

// Icons (you may need to import these from your icon library)
const RefreshIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" /></svg>' }

// Configuration
const iframeUrl = ref('http://localhost:8080') // Update this to your iframe URL
const isDevelopment = ref(process.env.NODE_ENV === 'development')

// Reactive state
const gpsIframe = ref(null)
const isIframeConnected = ref(false)
const accessToken = ref('') // In production, this should come from your auth system
const selectedGroup = ref('')
const messageLog = ref([])
const iframeStats = ref(null)

// Available groups - in production, fetch this from your API
const availableGroups = ref([
  { code: 'FLEET_001', name: 'Main Fleet' },
  { code: 'FLEET_002', name: 'Delivery Vehicles' },
  { code: 'FLEET_003', name: 'Emergency Vehicles' }
])

// Computed
const canSendCredentials = computed(() => accessToken.value && selectedGroup.value)

// Methods
const handleIframeLoad = () => {
  console.log('GPS iframe loaded')
  logMessage('iframe', 'IFRAME_LOADED', {})
  
  // Give iframe a moment to initialize then send credentials
  setTimeout(() => {
    if (canSendCredentials.value) {
      sendCredentials()
    }
  }, 1000)
}

const sendCredentials = () => {
  if (!gpsIframe.value?.contentWindow) {
    console.warn('Iframe not ready')
    return
  }

  // Send token
  if (accessToken.value) {
    const tokenMessage = {
      type: 'GPS_SET_TOKEN',
      payload: { token: accessToken.value }
    }
    gpsIframe.value.contentWindow.postMessage(tokenMessage, '*')
    logMessage('parent->iframe', 'GPS_SET_TOKEN', tokenMessage)
  }

  // Send group code
  if (selectedGroup.value) {
    const groupMessage = {
      type: 'GPS_SET_GROUP',
      payload: { groupCode: selectedGroup.value }
    }
    gpsIframe.value.contentWindow.postMessage(groupMessage, '*')
    logMessage('parent->iframe', 'GPS_SET_GROUP', groupMessage)
  }

  isIframeConnected.value = true
}

const updateToken = () => {
  if (isIframeConnected.value && accessToken.value) {
    const message = {
      type: 'GPS_SET_TOKEN',
      payload: { token: accessToken.value }
    }
    gpsIframe.value.contentWindow.postMessage(message, '*')
    logMessage('parent->iframe', 'GPS_SET_TOKEN', message)
  }
}

const updateGroup = () => {
  if (isIframeConnected.value && selectedGroup.value) {
    const message = {
      type: 'GPS_SET_GROUP',
      payload: { groupCode: selectedGroup.value }
    }
    gpsIframe.value.contentWindow.postMessage(message, '*')
    logMessage('parent->iframe', 'GPS_SET_GROUP', message)
  }
}

const refreshIframe = () => {
  if (gpsIframe.value) {
    gpsIframe.value.src = gpsIframe.value.src
    isIframeConnected.value = false
  }
}

const logMessage = (direction, type, data) => {
  messageLog.value.unshift({
    timestamp: new Date(),
    direction,
    type,
    data
  })
  
  // Keep only last 50 messages
  if (messageLog.value.length > 50) {
    messageLog.value = messageLog.value.slice(0, 50)
  }
}

const formatTime = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleTimeString()
}

// Message handler for iframe communication
const handleMessage = (event) => {
  // Security: In production, validate event.origin
  // if (event.origin !== 'https://your-trusted-domain.com') return;
  
  logMessage('iframe->parent', event.data.type, event.data)
  
  switch (event.data.type) {
    case 'GPS_REQUEST_TOKEN':
      if (accessToken.value) {
        event.source.postMessage({
          type: 'GPS_SET_TOKEN',
          payload: { token: accessToken.value }
        }, '*')
        logMessage('parent->iframe', 'GPS_SET_TOKEN', { token: '[HIDDEN]' })
      }
      break
      
    case 'GPS_REQUEST_GROUP':
      if (selectedGroup.value) {
        event.source.postMessage({
          type: 'GPS_SET_GROUP',
          payload: { groupCode: selectedGroup.value }
        }, '*')
        logMessage('parent->iframe', 'GPS_SET_GROUP', { groupCode: selectedGroup.value })
      }
      break
      
    case 'GPS_IFRAME_READY':
      console.log('GPS iframe is ready')
      isIframeConnected.value = true
      if (canSendCredentials.value) {
        sendCredentials()
      }
      break
      
    case 'GPS_STATS_UPDATE':
      iframeStats.value = event.data.payload
      break
      
    case 'GPS_ERROR':
      console.error('GPS iframe error:', event.data.payload)
      break
      
    default:
      console.log('Unknown message type:', event.data.type)
  }
}

// Watchers
watch([accessToken, selectedGroup], () => {
  if (isIframeConnected.value && canSendCredentials.value) {
    sendCredentials()
  }
})

// Lifecycle
onMounted(() => {
  window.addEventListener('message', handleMessage)
  
  // In production, you might want to load these from your API/auth system
  if (!isDevelopment.value) {
    // Example: Load from your authentication system
    // accessToken.value = await getTokenFromAuth()
    // selectedGroup.value = await getDefaultGroup()
  }
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.gps-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e1e5e9;
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.status-indicator.connected {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: #0056b3;
}

.refresh-btn .icon {
  width: 16px;
  height: 16px;
}

.controls-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.group-select,
.token-input {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.group-select:focus,
.token-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.send-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #218838;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.stats-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.online {
  color: #28a745;
}

.stat-value.error {
  color: #dc3545;
}

.iframe-container {
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.gps-iframe {
  width: 100%;
  height: 700px;
  border: none;
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-log {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.message-log h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
}

.log-messages {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-message {
  display: grid;
  grid-template-columns: 80px 120px 1fr;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #e9ecef;
}

.log-message:last-child {
  border-bottom: none;
}

.log-message .timestamp {
  color: #6c757d;
}

.log-message .direction {
  font-weight: bold;
}

.log-message.parent-iframe .direction {
  color: #007bff;
}

.log-message.iframe-parent .direction {
  color: #28a745;
}

.log-message .content {
  word-break: break-all;
}

/* Responsive */
@media (max-width: 768px) {
  .gps-dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .controls-panel {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    flex-direction: column;
    gap: 10px;
  }
  
  .gps-iframe {
    height: 500px;
  }
  
  .log-message {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>
