# Iframe Integration Documentation

## Overview

This GPS vehicle tracking application is designed to be embedded as an iframe component. It communicates with the parent window using the postMessage API to receive authentication tokens and group codes.

## Message Types

### From Parent to Iframe

#### Set Access Token
```javascript
iframe.contentWindow.postMessage({
  type: 'GPS_SET_TOKEN',
  payload: { token: 'your-access-token' }
}, '*');
```

#### Set Group Code
```javascript
iframe.contentWindow.postMessage({
  type: 'GPS_SET_GROUP', 
  payload: { groupCode: 'your-group-code' }
}, '*');
```

### From Iframe to Parent

#### Request Access Token
```javascript
window.parent.postMessage({
  type: 'GPS_REQUEST_TOKEN'
}, '*');
```

#### Request Group Code
```javascript
window.parent.postMessage({
  type: 'GPS_REQUEST_GROUP'
}, '*');
```

## Integration Examples

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>GPS Tracker Integration</title>
</head>
<body>
    <h1>Vehicle Tracking Dashboard</h1>
    
    <iframe 
        id="gps-tracker"
        src="https://your-app-url.com"
        width="100%" 
        height="600"
        frameborder="0">
    </iframe>

    <script>
        const iframe = document.getElementById('gps-tracker');
        const accessToken = 'your-gps-api-token';
        const groupCode = 'your-group-code';

        // Wait for iframe to load
        iframe.addEventListener('load', function() {
            // Send initial data
            sendDataToIframe();
        });

        function sendDataToIframe() {
            iframe.contentWindow.postMessage({
                type: 'GPS_SET_TOKEN',
                payload: { token: accessToken }
            }, '*');
            
            iframe.contentWindow.postMessage({
                type: 'GPS_SET_GROUP',
                payload: { groupCode: groupCode }
            }, '*');
        }

        // Listen for requests from iframe
        window.addEventListener('message', function(event) {
            if (event.data.type === 'GPS_REQUEST_TOKEN') {
                event.source.postMessage({
                    type: 'GPS_SET_TOKEN',
                    payload: { token: accessToken }
                }, '*');
            }
            
            if (event.data.type === 'GPS_REQUEST_GROUP') {
                event.source.postMessage({
                    type: 'GPS_SET_GROUP',
                    payload: { groupCode: groupCode }
                }, '*');
            }
        });
    </script>
</body>
</html>
```

### Vue.js 3 Composition API

```vue
<template>
  <div class="vehicle-dashboard">
    <h1>Vehicle Tracking Dashboard</h1>
    
    <div class="controls">
      <button @click="refreshData">Refresh Data</button>
      <select v-model="selectedGroup" @change="updateGroup">
        <option value="">Select Group</option>
        <option v-for="group in groups" :key="group.code" :value="group.code">
          {{ group.name }}
        </option>
      </select>
    </div>
    
    <iframe 
      ref="gpsIframe"
      :src="iframeUrl"
      @load="handleIframeLoad"
      class="gps-iframe"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Configuration
const iframeUrl = 'https://your-app-url.com'
const accessToken = 'your-gps-api-token'

// Reactive data
const gpsIframe = ref(null)
const selectedGroup = ref('DEFAULT_GROUP')
const groups = ref([
  { code: 'GROUP1', name: 'Fleet 1' },
  { code: 'GROUP2', name: 'Fleet 2' }
])

// Methods
const handleIframeLoad = () => {
  console.log('GPS iframe loaded')
  sendInitialData()
}

const sendInitialData = () => {
  if (gpsIframe.value?.contentWindow) {
    // Send token
    gpsIframe.value.contentWindow.postMessage({
      type: 'GPS_SET_TOKEN',
      payload: { token: accessToken }
    }, '*')
    
    // Send group code
    gpsIframe.value.contentWindow.postMessage({
      type: 'GPS_SET_GROUP',
      payload: { groupCode: selectedGroup.value }
    }, '*')
  }
}

const updateGroup = () => {
  if (gpsIframe.value?.contentWindow) {
    gpsIframe.value.contentWindow.postMessage({
      type: 'GPS_SET_GROUP',
      payload: { groupCode: selectedGroup.value }
    }, '*')
  }
}

const refreshData = () => {
  sendInitialData()
}

// Message handler
const handleMessage = (event) => {
  // Security: Check origin if needed
  // if (event.origin !== 'https://your-trusted-domain.com') return;
  
  switch (event.data.type) {
    case 'GPS_REQUEST_TOKEN':
      event.source.postMessage({
        type: 'GPS_SET_TOKEN',
        payload: { token: accessToken }
      }, '*')
      break
      
    case 'GPS_REQUEST_GROUP':
      event.source.postMessage({
        type: 'GPS_SET_GROUP', 
        payload: { groupCode: selectedGroup.value }
      }, '*')
      break
      
    case 'GPS_IFRAME_READY':
      console.log('GPS iframe is ready')
      sendInitialData()
      break
      
    default:
      console.log('Unknown message type:', event.data.type)
  }
}

// Watchers
watch(selectedGroup, () => {
  updateGroup()
})

// Lifecycle
onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.vehicle-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.controls button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.controls select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.gps-iframe {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

### React Functional Component

```jsx
import React, { useRef, useEffect, useState } from 'react';

const VehicleDashboard = () => {
  const iframeRef = useRef(null);
  const [selectedGroup, setSelectedGroup] = useState('DEFAULT_GROUP');
  
  const accessToken = 'your-gps-api-token';
  const iframeUrl = 'https://your-app-url.com';
  
  const groups = [
    { code: 'GROUP1', name: 'Fleet 1' },
    { code: 'GROUP2', name: 'Fleet 2' }
  ];

  const sendDataToIframe = () => {
    if (iframeRef.current?.contentWindow) {
      // Send token
      iframeRef.current.contentWindow.postMessage({
        type: 'GPS_SET_TOKEN',
        payload: { token: accessToken }
      }, '*');
      
      // Send group
      iframeRef.current.contentWindow.postMessage({
        type: 'GPS_SET_GROUP',
        payload: { groupCode: selectedGroup }
      }, '*');
    }
  };

  const handleMessage = (event) => {
    switch (event.data.type) {
      case 'GPS_REQUEST_TOKEN':
        event.source.postMessage({
          type: 'GPS_SET_TOKEN',
          payload: { token: accessToken }
        }, '*');
        break;
        
      case 'GPS_REQUEST_GROUP':
        event.source.postMessage({
          type: 'GPS_SET_GROUP',
          payload: { groupCode: selectedGroup }
        }, '*');
        break;
        
      case 'GPS_IFRAME_READY':
        sendDataToIframe();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedGroup]);

  useEffect(() => {
    // Update group when selection changes
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'GPS_SET_GROUP',
        payload: { groupCode: selectedGroup }
      }, '*');
    }
  }, [selectedGroup]);

  return (
    <div className="vehicle-dashboard">
      <h1>Vehicle Tracking Dashboard</h1>
      
      <div className="controls">
        <button onClick={sendDataToIframe}>
          Refresh Data
        </button>
        
        <select 
          value={selectedGroup} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group.code} value={group.code}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        onLoad={sendDataToIframe}
        width="100%"
        height="600"
        frameBorder="0"
        title="GPS Vehicle Tracker"
      />
    </div>
  );
};

export default VehicleDashboard;
```

## Security Considerations

### Origin Validation
```javascript
// Always validate the origin of postMessage events
window.addEventListener('message', function(event) {
  // Only accept messages from trusted domains
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }
  
  // Process the message
  handleMessage(event);
});
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-ancestors 'self' https://trusted-domain.com;">
```

### HTTPS Requirements
- Both parent and iframe must use HTTPS in production
- Mixed content (HTTP iframe in HTTPS parent) will be blocked

## Troubleshooting

### Common Issues

#### 1. Messages Not Received
- Check if iframe has fully loaded before sending messages
- Verify the target origin parameter
- Ensure message structure matches expected format

#### 2. CORS Errors
- Configure proper CORS headers on the iframe server
- Set appropriate `frame-ancestors` directive

#### 3. Authentication Failures
- Verify token format and validity
- Check API endpoint accessibility
- Ensure proper headers are set

### Debug Mode

Enable debug logging in development:

```javascript
// In iframe application
if (process.env.NODE_ENV === 'development') {
  window.postMessage({
    type: 'GPS_DEBUG_LOG',
    payload: { message: 'Debug info here' }
  }, '*');
}
```

## Best Practices

1. **Always validate message origins** for security
2. **Implement error handling** for failed API calls
3. **Use loading states** for better UX
4. **Cache tokens** appropriately to reduce requests
5. **Handle iframe resize** responsively
6. **Implement retry logic** for failed communications
7. **Provide fallback content** when iframe fails to load

## API Rate Limits

The GPS API has the following limits:
- **Requests per minute**: 60
- **Requests per hour**: 1000
- **Concurrent connections**: 10

Implement proper caching and request queuing to stay within limits.